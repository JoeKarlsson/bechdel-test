# Page vs screen: methods

**Status: version 1.0 (2026-11-12).** The thresholds in §5.4 were tuned on the development half of the labelled sample (§6) and frozen before the test half was scored for the record. §6.1 reports the accuracy and every departure from the plan. Anything not listed in §2 is exploratory.

Code: `src/opus.js` (corpus access), `src/subtitles.js` (cleaning), `src/align.js` (alignment), `src/pageVsScreen.js` (selection, labels, the Bechdel test on screen), `scripts/fetch-subtitles.js`, `scripts/screen.js`. Every output file (`data/screen/<id>.json`) records the method version and thresholds it was made with.

## 1. Question

A screenplay is a draft. Between the page and the release, lines are cut in the edit, rewritten on set, improvised or moved. bechdel.io scores films from their scripts, so we measure how far each script is from the film as released, and whether that changes its Bechdel verdict.

## 2. Research questions

- **RQ1.** How much of a script's dialogue reaches the screen? Measure: *word survival*, the share of script dialogue words heard in the film (§5).
- **RQ2.** How much of what's said on screen isn't in the script? Measure: the share of subtitle words with no match in the script.
- **RQ3.** Are women's lines cut at a different rate than men's?
- **RQ4.** How often does the Bechdel verdict differ between page and screen, and in which direction?
- **RQ5** (added 2026-11-12, before computing). How long, in screen time, are the conversations that make a film pass?
- **RQ6** (added 2026-11-12, before computing). Are conversations between women cut more than the rest of women's dialogue in the same film?

## 3. Data

**Scripts.** The scripts already on the shelf, parsed by the same parser that scores them (`src/screenplay.js`). Speaker genders come from the same cast matching and hand corrections (`data/gender-overrides.json`).

**Subtitles.** The English part of the OPUS OpenSubtitles corpus, release v2024 (Lison & Tiedemann 2016; Lison, Tiedemann & Kouylekov 2018): subtitles uploaded to opensubtitles.org, filed by IMDb id, split into timed sentences.
- 2,273 of the 2,354 shelf films are in it, with a median of 17 English versions each.
- Only the needed files are read out of the 36 GB archive, with HTTP range requests.
- Subtitle text stays off the public repository (`subtitles/local/` is gitignored).

## 4. Which subtitles stand for a film

Rules are applied to every candidate version, in this order, from metadata and content alone:

1. Not machine-translated.
2. Language confidence at least 0.9, when the corpus gives one.
3. One file for the whole film (`cds` 1/1). Multi-CD uploads restart their timing.
4. At least 300 lines after cleaning (§5.1).
5. The last line falls between 85% and 110% of TMDB's runtime, which removes partial files and other cuts of the film.
6. Not a duplicate: versions identical after normalization (§5.2) count once.

Of the versions left, up to nine are taken in a fixed pseudo-random order: sorted by the SHA-1 of `page-vs-screen-2026-11-12:<subtitle id>`.

- **Consensus.** A script word is *heard* when it matches in more than half of the versions used. One subtitler's shortening or omission can't make a line look cut.
- **Primary version.** The version with the highest mean agreement with the others (the medoid) supplies timing, line text for quotes, and the Bechdel test on screen.
- **Agreement** between two versions is the share of their words that align with each other (2 × matched ÷ total). The mean over all pairs is stored per film as a reliability figure.

## 5. Alignment

### 5.1 Cleaning subtitles

- Strip markup (`<i>`, `{\an8}`).
- Drop lines with ♪, ♫ or # (lyrics), and credit or advertising lines (subtitler credits, web addresses).
- Remove sound tags in `[...]` or `(...)`.
- Keep speaker labels (`KAT:`, `[Kat]`) as evidence of who speaks, and take them out of the text.
- Strip leading dialogue dashes.
- Drop lines of only hesitations.

A version counts as SDH (subtitles for the deaf and hard of hearing) when at least 3% of its lines carry sound tags or speaker labels.

### 5.2 Normalization, on both sides

- Lower-case; strip accents; use one apostrophe form, then remove apostrophes.
- Write numbers 0–99 as words.
- Split on anything that isn't a letter or digit.
- Map a fixed list of spoken forms to one spelling: gonna → going to, wanna → want to, gotta → got to, ok → okay, mr → mister, 'em → them, til → until, cause → because, and dropped-g forms such as talkin → talking. The full list is in `src/align.js`.
- Drop the hesitations uh, um, uhm, er, erm, ah, hmm, mm, mmm, hm.

### 5.3 Word alignment

Script dialogue (in script order) and subtitle lines (in time order) each become one sequence of words.

1. **Anchors.** Word 4-grams that occur exactly once in each sequence. The longest chain of them that increases on both sides is kept, as in patience diff.
2. **Recursion.** Between neighbouring anchors, the search repeats with 3-grams. Inside gaps of at most 80 words on both sides it continues with 2-grams and single words.
3. **Exact alignment.** A gap with no anchors and at most 250,000 cells (script words × subtitle words) gets an exact longest common subsequence.
4. **Lone matches.** A one-word match with no matched neighbour is dropped, unless that word is its whole script line or whole subtitle line.
5. **Moved passages.** Unmatched script runs of 12 or more words are matched against unmatched subtitle words anywhere in the film, by shared unique 4-grams extended forward. These are labelled *moved*.

### 5.4 Labels

The word measures in §2 use no thresholds. Line labels do (provisional, see Status):

- A script line is **heard as written** when at least 80% of its words are heard, **changed** at 30–80%, and **cut** below 30%.
- A subtitle line in the primary version is **not in the script** when under 20% of its words match. Otherwise it is assigned to the script line most of its matched words came from.

"Not in the script" means *not in this draft*. An improvisation, a rewrite in a later draft, ADR and a reshoot look the same. "Cut" includes words a subtitler shortened, which §6 measures.

## 6. Validation

- **Known-answer controls.** These lines are documented as improvised or rewritten, and must come out *not in the script*:
  - Taxi Driver: "You talking to me?"
  - Midnight Cowboy: "I'm walking here!"
  - Blade Runner: "tears in rain"
  - Jaws: "bigger boat"
  - Good Will Hunting: the therapist's wife story

  When the script is a transcript, these lines match, which is how transcripts were noticed (§7). In the pilot, The Shining's post-production script matched "Here's Johnny!" and Casablanca's matched "Here's looking at you, kid".

- **Gold sample.**
  - Twenty films drawn with a recorded seed, stratified by era (before 1990, 1990–2005, after 2005) and by whether the primary version is SDH.
  - Per film: 30 script lines (stratified by predicted label) and 10 subtitle lines predicted *not in the script* (these measure that label's precision; its recall isn't measured).
  - Each item is labelled blind to the prediction, following a written codebook (`CODEBOOK.md`). The labeller sees the line, its context, and the film's full script dialogue and subtitles to search (`npm run screen:label -- --export`).
  - Labels are stored as line indexes, not text (`data/eval/screen-gold.json`).

- **Split.** Ten films (development) tune §5.4's thresholds and §7's transcript rule. The other ten (test) are scored once, after version 1.0 is frozen. Each script line is weighted by how many lines of its film its sampling stratum stands for, so the scores describe whole films. We report weighted precision, recall and F1 per label, with 95% bootstrap intervals that resample films.

- **Agreement between labellers.** A second, independent labeller labels a seeded 100 of the items, and we report Cohen's κ.

- **Audio spot-check.** About 100 test-set lines labelled *cut* or *changed* are checked against the film's audio, separating real changes from subtitler shortening. This gives the false-cut rate.

### 6.1 What was done, and the results

**Who labelled.** The sample was labelled by AI annotators, not people: five separate instances of Anthropic's Claude.
- Four split the 20 films and labelled all 800 items. A fifth labelled the seeded 100-item second set without access to the others' labels.
- Each worked only from the exported items, the films' script and subtitle text, and the codebook. None could see the pipeline's predictions or code.
- Annotators of the same model are not independent the way two people are, so the agreement below is an upper bound on what two human labellers would reach.

| | Development (10 films) | Test (10 films, scored once) |
|---|---|---|
| Macro F1, script line labels | 0.80 [0.75, 0.83] | 0.80 [0.75, 0.83] |
| *Heard as written*: precision / recall | 0.94 / 0.86 | 0.95 / 0.85 |
| *Changed*: precision / recall | 0.64 / 0.58 | 0.68 / 0.55 |
| *Cut*: precision / recall | 0.82 / 0.98 | 0.81 / 0.98 |
| *Not in the script*: precision | 0.65 | 0.73 |

Intervals are 95%, from bootstrapping films. Agreement between the two labellings is Cohen's κ = 0.92 over 100 items.

- **Tuned thresholds.** Heard as written at 65% or more of a line's words, changed at 15% or more (provisional values were 80% and 30%). *Not in the script* stays at 20%: since only lines predicted not in the script were sampled, its threshold can't be tuned on this sample.
- **What the scores mean.**
  - The aligner is reliable on lines heard as written and on cuts.
  - *Changed* is the hardest label, for labellers too.
  - *Not in the script* measures wording. About a third of the lines it flags are script lines said in different words, which the codebook counts as scripted. RQ2's figure is therefore an upper bound on new material: read it as "words not in the script".
- **Departures from the plan.**
  1. The tuning run printed the test films' scores before the thresholds were frozen. They were not used to choose anything, and the frozen thresholds are the ones the development films picked. The script no longer shows test scores while tuning.
  2. After the development results, two aligner settings were tried on the development films only: a larger exact-alignment limit and short anchors in larger gaps. Neither changed the *not in the script* precision, so both were dropped and the aligner is unchanged.
  3. While labelling, two annotators wrote helper scripts (no labels) to the same scratch folder, and one overwrote the other's. Neither read the other's labels.
  4. The audio spot-check was not done: nobody listened to the films. The share of "cut" and "changed" lines that are really subtitlers shortening speech is unmeasured. The SDH-only robustness check (§9) is a partial stand-in, since SDH subtitles are closer to verbatim.

## 7. Exclusions

Decided from inputs, never from results:

- **Transcripts.** Some scripts online were written from the finished film ("post-production script", "transcript", "as broadcast", "continuity script", "dialogue list", or a title page with release date and running time). They can't show change, so they are excluded. Films with survival above 95% are listed for a manual look but are not excluded for their result.
- **No usable subtitles.** No version passes §4.
- **Wrong film or language.** Under 6% of script words align with the primary version. The bar is set at chance: 300 scripts, each aligned with another film's subtitles (seeded pairing), matched a median 1.7% of their words, 3.9% at the 99th percentile and 5.7% at most. A script below 6% matches its film no better than an unrelated one. These films are still measured, and a robustness check puts them back (§9). Below chance, a wrong match and a draft rewritten beyond recognition look the same (Rush Hour's original screenplay, written before Jackie Chan was cast, is one), so the bar can't tell which a film is. A check on character names was tried to separate them and rejected: real films failed it whenever the subtitles use a nickname (Lady Bird matched 91% of its words but 10% of its names). (Draft 0.1 used 20%, which excluded heavily rewritten drafts for their result. The null distribution replaced it before any result was reported.)

Each script's draft is labelled from its title page as *shooting* (shooting script, final, revised, coloured revision pages), *early* (first, second or rough draft) or *unknown*. Results are reported by draft, since earlier drafts are expected to show more change.

## 8. The Bechdel test on screen

The unchanged scorer (`src/bechdel/score.js`) runs on a "screen screenplay":

- the primary version's lines in time order;
- each matched line with the speaker and scene of its script line, and the subtitle's words;
- each line not in the script placed in the scene of the line before it, with its speaker taken from an SDH label when that names a script speaker.

Lines with no known speaker are read two ways:

- **strict**: as an unnamed man, which breaks a conversation between women;
- **lenient**: as absent.

A verdict differs from the page's only when both readings agree. Otherwise it is reported as *unclear*. Because the same instrument scores both sides, its known errors (80% agreement with bechdeltest.com readers, `npm run eval`) affect page and screen alike.

### 8.1 Passing conversations in screen time (RQ5)

For a film that passes on screen under the strict reading, the *passing conversations* are the exchanges that meet rule 3 in the strict screen screenplay: consecutive lines in one scene, spoken only by named women, at least two of them, mentioning no man.

- A conversation's length is the end of its last subtitle line minus the start of its first.
- Per film we store the number of passing conversations, their total length and the longest.
- Subtitle timing is display time, which subtitlers pad for reading, so lengths are approximate. Offsets between releases don't matter, since only differences are used.

### 8.2 Which dialogue gets cut (RQ6)

On the page, using the line labels of §5.4 (consensus across versions), each script line by a named woman falls in one of two groups:

- **in a women's conversation**: part of a rule-2 exchange (two or more named women, consecutive lines in a scene, any topic);
- **other women's lines**: every other line by a named woman.

Comparing women's lines with women's lines keeps speaker gender fixed, which RQ3 already covers. The mirror comparison, men's conversations against men's other lines, tests whether any effect is about conversations between women or about same-gender conversations in general.

## 9. Analysis (`npm run screen:stats`)

- **RQ1/RQ2.** Median and interquartile range of word survival and of the not-in-script share, overall and by draft, decade and SDH.
- **RQ3.** The unit is the film, to avoid counting each line as an independent observation.
  - For films where women and men each speak at least 20 lines, take the paired difference in the share of lines cut (women minus men).
  - Report a Wilcoxon signed-rank test, and the median difference with a 95% bootstrap interval (10,000 resamples, fixed seed).
- **RQ4.** The share of films whose verdict differs, with a 95% Wilson interval, and McNemar's test on paired page and screen pass.
- **RQ5.** Descriptive: median and interquartile range of the total and the longest passing conversation, and the share of passing films whose passing conversations total under 10, 30 and 60 seconds. No test.
- **RQ6.** The unit is the film: those with at least 10 script lines in each group (§8.2).
  - The outcome is the share of lines cut. We take the paired difference (women's conversations minus other women's lines).
  - Report a Wilcoxon signed-rank test, and the median difference with a 95% bootstrap interval (10,000 resamples, fixed seed).
  - The same test on men's conversations against men's other lines is the control.
  - The share changed (rather than cut) is exploratory.
- **Robustness.** Every headline is re-run on SDH-primary films only, shooting drafts only, versions with mean agreement of at least 0.8, and with the chance-level films (§7) put back. We report whether each conclusion holds.

## 10. Limits

- Scripts that are online skew popular, American and recent. Subtitles on opensubtitles.org skew the same way.
- Results describe "shelf films with an English script and English subtitles", not film in general.
- Word survival has a chance floor of about 2%: unrelated dialogue shares that many words in matching order (§7).
- Subtitles are not a transcript of speech, and the audio spot-check that would measure the gap wasn't done (§6.1).
- Speaker attribution on screen is borrowed from the script. Lines not in the script often have no known speaker, which is why §8 reports two readings.

## References

- Lison, P. & Tiedemann, J. (2016). OpenSubtitles2016: Extracting Large Parallel Corpora from Movie and TV Subtitles. *LREC 2016*. https://aclanthology.org/L16-1147/
- Lison, P., Tiedemann, J. & Kouylekov, M. (2018). OpenSubtitles2018: Statistical Rescoring of Sentence Alignments in Large, Noisy Parallel Corpora. *LREC 2018*. https://aclanthology.org/L18-1275/
- Everingham, M., Sivic, J. & Zisserman, A. (2006). "Hello! My name is... Buffy": automatic naming of characters in TV video. *BMVC 2006*. (Subtitles aligned with transcripts by dynamic time warping.)
- Agarwal, A., Zheng, J., Kamath, S., Balasubramanian, S. & Ann Dey, S. (2015). Key Female Characters in Film Have More to Talk About Besides Men: Automating the Bechdel Test. *NAACL 2015*. https://aclanthology.org/N15-1084/
