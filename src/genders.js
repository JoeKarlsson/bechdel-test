// Works out each speaker's gender, and whether they are a named character,
// from three kinds of evidence, strongest first:
//   1. the TMDB cast: "JAKE" or "SULLY" for "Jake Sully" (TMDB gender 1 = woman, 2 = man)
//   2. a gendered word in the speaker's name: MRS. DAVIS, MOTHER, WAITRESS, KING
//   3. pronouns near the name in the stage directions: "Jane enters. She ..."
// Anything still unresolved stays null and doesn't count for either side.

const WOMAN_WORDS = new Set([
	'MRS', 'MS', 'MISS', 'MADAME', 'MADAM', 'MME', 'MLLE', 'LADY', 'DAME', 'QUEEN', 'PRINCESS', 'DUCHESS', 'COUNTESS', 'EMPRESS',
	'BARONESS', 'MOTHER', 'MOM', 'MOMMY', 'MUM', 'MUMMY', 'MAMA', 'MAMMA', 'MA', 'GRANDMA', 'GRANDMOTHER', 'GRANNY', 'NANA', 'AUNT',
	'AUNTIE', 'SISTER', 'NUN', 'ABBESS', 'WIFE', 'GIRLFRIEND', 'BRIDE', 'DAUGHTER', 'NIECE', 'GIRL', 'GIRLS', 'WOMAN', 'WOMEN',
	'LADIES', 'WAITRESS', 'ACTRESS', 'HOSTESS', 'STEWARDESS', 'HEROINE', 'WITCH', 'SENORA', 'SENORITA', 'SIGNORA', 'FRAU',
	'FRAULEIN', 'MAID', 'MAIDEN', 'HOUSEWIFE', 'MATRON', 'GODMOTHER', 'STEPMOTHER', 'STEPSISTER', 'SORORITY', 'COWGIRL',
	'SALESWOMAN', 'POLICEWOMAN', 'CHAIRWOMAN', 'CONGRESSWOMAN', 'BUSINESSWOMAN', 'SPOKESWOMAN', 'GODDESS', 'PRIESTESS',
	'MISTRESS', 'SEAMSTRESS', 'GOVERNESS', 'HEIRESS', 'DIVORCEE', 'FIANCEE', 'BALLERINA', 'SHOWGIRL', 'NANNY', 'MATRIARCH',
]);
const MAN_WORDS = new Set([
	'MR', 'MISTER', 'SIR', 'LORD', 'KING', 'PRINCE', 'DUKE', 'EARL', 'BARON', 'COUNT', 'EMPEROR', 'FATHER', 'DAD', 'DADDY', 'PAPA',
	'PA', 'POP', 'POPS', 'GRANDPA', 'GRANDFATHER', 'GRAMPS', 'UNCLE', 'BROTHER', 'MONK', 'FRIAR', 'PRIEST', 'BISHOP', 'POPE',
	'HUSBAND', 'BOYFRIEND', 'GROOM', 'BRIDEGROOM', 'SON', 'NEPHEW', 'BOY', 'BOYS', 'MAN', 'MEN', 'GUY', 'GUYS', 'GENTLEMAN',
	'GENTLEMEN', 'WAITER', 'ACTOR', 'HOST', 'STEWARD', 'MONSIEUR', 'SENOR', 'SIGNOR', 'HERR', 'MASTER', 'FELLA', 'FELLOW',
	'DUDE', 'BUTLER', 'SALESMAN', 'POLICEMAN', 'FIREMAN', 'CHAIRMAN', 'CONGRESSMAN', 'BUSINESSMAN', 'SPOKESMAN', 'FISHERMAN',
	'DOORMAN', 'COWBOY', 'BELLBOY', 'BELLHOP', 'GODFATHER', 'STEPFATHER', 'STEPBROTHER', 'FRATERNITY', 'HERO', 'WIZARD',
	'GOD', 'PATRIARCH', 'WIDOWER', 'FIANCE', 'MONSIGNOR', 'REVEREND', 'RABBI', 'SULTAN', 'SHEIK', 'CZAR', 'TSAR', 'PHARAOH',
	'BRO', 'BUDDY', 'GUNMAN', 'FOREMAN', 'WATCHMAN', 'MAILMAN', 'MILKMAN', 'HANDYMAN', 'MIDDLEMAN', 'BAGMAN', 'HITMAN',
	'NEWSMAN', 'CAMERAMAN', 'CLERGYMAN', 'CRAFTSMAN', 'FRONTMAN', 'HENCHMAN', 'HORSEMAN', 'LAWMAN', 'MADMAN', 'SNOWMAN', 'STRONGMAN',
]);
// Words that describe rather than name: "YOUNG JANE", "OLD MAN", "DR. GRANT"
const DESCRIPTORS = new Set([
	'YOUNG', 'YOUNGER', 'OLD', 'OLDER', 'LITTLE', 'BIG', 'TEEN', 'TEENAGE', 'ADULT', 'BABY', 'KID', 'KIDS', 'CHILD', 'THE', 'A', 'AN',
	'DR', 'DOCTOR', 'PROF', 'PROFESSOR', 'CAPT', 'CAPTAIN', 'COL', 'COLONEL', 'GEN', 'GENERAL', 'LT', 'LIEUTENANT', 'SGT',
	'SERGEANT', 'CPL', 'CORPORAL', 'MAJ', 'MAJOR', 'ADM', 'ADMIRAL', 'CMDR', 'COMMANDER', 'AGENT', 'DET', 'DETECTIVE',
	'OFFICER', 'INSPECTOR', 'CHIEF', 'JUDGE', 'SENATOR', 'PRESIDENT', 'GOVERNOR', 'MAYOR', 'COACH', 'NURSE', 'DEPUTY', 'SHERIFF',
	'PRIVATE', 'PVT', 'SPECIALIST', 'ENSIGN', 'COMMANDANT', 'DOC', 'SAINT', 'ST', 'UNCLE', 'AUNT', 'VOICE', 'VOICES', 'NEW',
]);
// Speakers that are never one named character
const GENERIC = /^(?:ALL|BOTH|EVERYONE|EVERYBODY|TOGETHER|CROWD|VOICE|VOICES|MAN|WOMAN|BOY|GIRL|KID|CHILD|NARRATOR|ANNOUNCER|REPORTER|NEWSCASTER|ANCHOR|RADIO|TV|TELEVISION|PA SYSTEM|INTERCOM|COMPUTER)\b|#|\d/;

// Name words, without accents and without possessives ("TIFFANY'S HUSBAND" isn't Tiffany)
const words = name => name
	.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
	.replace(/\b[A-Z0-9]+['’]S\b/gi, ' ')
	.replace(/[.,'’]/g, ' ')
	.split(/[\s/&-]+/)
	.filter(Boolean);
const titleCase = w => w.charAt(0) + w.slice(1).toLowerCase();
const escape = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Name lookups from the TMDB cast: full character name, and each first or last
 * name, to what valueOf gives for the cast member (the actor's gender, or the
 * actor). A name that leads to two different values ("SMITH" for Mr. and Mrs.
 * Smith) maps to null, or with firstBilled to the first in the cast's order
 * ("CLARICE" is Clarice Starling, not Young Clarice).
 */
const castIndex = (cast, valueOf, { firstBilled = false } = {}) => {
	const full = new Map();
	const part = new Map();
	const put = (map, key, value) => {
		if (!key || key.length < 2 || (firstBilled && map.has(key))) return;
		map.set(key, map.has(key) && map.get(key) !== value ? null : value);
	};
	for (const member of cast) {
		const value = valueOf(member);
		if (!value || !member.character) continue;
		// "Neytiri (voice)", "Jake Sully / Avatar", 'Frank "The Tank" Ricard'
		for (const role of member.character.split(/\s+\/\s+|\s*;\s*/)) {
			const nickname = role.match(/["“]([^"”]+)["”]|\s'([^']+)'\s/)?.slice(1).find(Boolean);
			const clean = role.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\([^)]*\)/g, ' ')
				.replace(/["“”]|\s'|'\s/g, ' ').toUpperCase().replace(/\s+/g, ' ').trim();
			put(full, clean, value);
			if (nickname) put(full, nickname.toUpperCase(), value);
			for (const w of words(clean)) if (!DESCRIPTORS.has(w) && !WOMAN_WORDS.has(w) && !MAN_WORDS.has(w)) put(part, w, value);
		}
	}
	return { full, part };
};

/**
 * Gender from pronouns in the stage directions just after each mention of
 * the name: 'w' or 'm' when there are at least 3 and they agree 3 to 1.
 * (Tried and measured worse: counting only sentences the character opens, and
 * letting strong pronoun evidence override the cast.)
 */
const pronounGender = (name, actionText) => {
	const token = words(name).filter(w => !DESCRIPTORS.has(w) && w.length > 2).pop();
	if (!token) return null;
	let she = 0;
	let he = 0;
	const mention = new RegExp(`\\b(?:${escape(token)}|${escape(titleCase(token))})\\b([^.!?]*[.!?]\\s*[^.!?]*)`, 'g');
	for (const [, after] of actionText.matchAll(mention)) {
		const window = after.slice(0, 160);
		she += (window.match(/\b(?:she|her|hers|herself)\b/gi) || []).length;
		he += (window.match(/\b(?:he|him|his|himself)\b/gi) || []).length;
	}
	if (she + he < 3) return null;
	if (she >= 3 * he) return 'w';
	if (he >= 3 * she) return 'm';
	return null;
};

/**
 * @param {string[]} speakers - normalized speaker names from the parser
 * @param {Array<{character: string, gender: number, name: string}>} cast - TMDB cast (name is the actor)
 * @param {string} actionText - all stage directions, for pronoun evidence
 * @param {Object<string, 'w'|'m'>} genderOverrides - genders set by hand, for picking each speaker's actor
 * @returns {Map<string, {gender: 'w'|'m'|null, named: boolean, source: string|null, actor: string|null}>}
 */
const resolveSpeakers = (speakers, cast, actionText, genderOverrides = {}) => {
	const { full, part } = castIndex(cast, member => (member.gender === 1 ? 'w' : member.gender === 2 ? 'm' : null));
	// Actors by the speaker's gender, so MRS. KANE gets Kane's wife and not Orson Welles
	const actorIndex = keep => castIndex(cast, member => (keep(member) ? member.name : null), { firstBilled: true });
	// (an actor TMDB has no gender for stays a candidate either way)
	const actorsBy = { w: actorIndex(m => m.gender !== 2), m: actorIndex(m => m.gender !== 1), any: actorIndex(() => true) };
	const resolved = new Map();
	for (const speaker of speakers) {
		const w = words(speaker);
		const nameWords = w.filter(x => !DESCRIPTORS.has(x) && !WOMAN_WORDS.has(x) && !MAN_WORDS.has(x));
		const generic = GENERIC.test(speaker);
		let gender = null;
		let source = null;

		const fullMatch = full.get(speaker) ?? full.get(nameWords.join(' '));
		const titleWords = w.filter(x => WOMAN_WORDS.has(x) || MAN_WORDS.has(x));
		const titleGender = titleWords.length && titleWords.every(x => WOMAN_WORDS.has(x)) ? 'w'
			: titleWords.length && titleWords.every(x => MAN_WORDS.has(x)) ? 'm' : null;
		const partGenders = new Set(nameWords.map(x => part.get(x)).filter(g => g !== undefined));

		if (fullMatch) {
			gender = fullMatch;
			source = 'cast';
		} else if (titleGender) {
			gender = titleGender;
			source = 'title';
		} else if (partGenders.size === 1 && [...partGenders][0]) {
			gender = [...partGenders][0];
			source = 'cast';
		}
		if (!gender && !generic) {
			gender = pronounGender(speaker, actionText);
			source = gender ? 'pronouns' : null;
		}
		// Named: a name word the stage directions use as a proper noun
		// mid-sentence ("... and Grace turns")
		// (a cast name needs it once, anything else twice), which rules out roles
		// like FASHIONISTA or SECRETARY OF STATE that only open sentences
		const midSentence = x => (actionText.match(new RegExp(`[a-z,;] (?:${escape(titleCase(x))}|${escape(x)})\\b`, 'g')) || []).length;
		const properNoun = nameWords.some(x => x.length > 1 && midSentence(x) >= (part.has(x) ? 1 : 2));
		// Who plays them: the same name matching, against actors instead of genders
		const actors = actorsBy[genderOverrides[speaker] ?? gender] ?? actorsBy.any;
		const partActors = new Set(nameWords.map(x => actors.part.get(x)).filter(a => a !== undefined));
		const actor = actors.full.get(speaker) ?? actors.full.get(nameWords.join(' '))
			?? (partActors.size === 1 ? [...partActors][0] : null);
		resolved.set(speaker, { gender, named: !generic && nameWords.length > 0 && properNoun, source, actor });
	}
	return resolved;
};

module.exports = { resolveSpeakers, WOMAN_WORDS, MAN_WORDS };
