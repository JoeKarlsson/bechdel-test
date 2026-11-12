# Page vs screen: labelling codebook

How the hand-checked sample (METHODS.md §6) is labelled. The labeller sees the line, its context, and the film's full script dialogue and subtitles to search, never the pipeline's answer.

## Script lines: "Is this script line said in the film?"

Judge by meaning and wording together, using the subtitles as the record of what's said.

| Label | When |
|---|---|
| **kept** | Said as written. Small differences don't matter: contractions, a filler word ("oh", "well") added or dropped, punctuation, a name in place of a pronoun, a word or two out of a long line. Rule of thumb: nearly all its words are said, in the same sense. |
| **changed** | The same line is said, recognisably, but reworded, cut down to part of it, or with words added. Rule of thumb: some of its substance is said, not all. |
| **cut** | Not said anywhere in the film, or only a few incidental words in common (a "yes", a name). |
| **unsure** | The subtitles can't settle it: the line could be inside a garbled or missing stretch, or the context doesn't show what happened. Use sparingly. |

- **Search before saying cut.** If the line isn't near where it would be, search the full subtitles for distinctive words. A line said elsewhere in the film (moved in the edit) is labelled by how closely it's said: kept or changed.
- **A long line split across several subtitle lines** is one line: judge all of it.
- **Speaker doesn't matter** here (subtitles rarely say who speaks). Only whether the words are said.
- **Lyrics** (sung lines) are left out of the subtitles, so a sung script line can't be judged: label it unsure.

## Subtitle lines: "Is this subtitle line in the script, even reworded?"

| Label | When |
|---|---|
| **scripted** | Some script line says this, even reworded or partly. Search the full script for distinctive words before deciding. |
| **not in script** | No script line corresponds: an addition, an improvisation, a rewrite with new content, or a line from a scene the script doesn't have. |
| **unsure** | Can't tell, for instance a one-word line ("What?") that could match many script lines or none. |

## Recording

Labels are recorded by item key (`<film id>:page:<n>` or `<film id>:screen:<n>`) and imported with `npm run screen:label -- --import`. The gold file stores line numbers and text hashes, never text.
