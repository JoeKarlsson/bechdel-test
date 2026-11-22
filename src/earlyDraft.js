/**
 * Whether a script is an early draft, from what its title page says, and the
 * date the title page gives it. The film may differ from an early draft, so
 * its page says so.
 */
const { draftLabel } = require('./pageVsScreen');

// The title page: dates further in are story dates ("1967"), not the draft's
const TITLE_PAGE_CHARACTERS = 3000;
const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
// "March 29, 1990", "March 29 1990" or "March 1990"; a bare year is too often a story date
const DATE = new RegExp(`\\b(?:${MONTHS})\\s+(?:\\d{1,2},?\\s+)?(?:19|20)\\d\\d\\b`, 'i');

/** { date } for an early draft (date null when the title page has none), else null */
const earlyDraftOf = scriptText => {
	if (draftLabel(scriptText) !== 'early') return null;
	const date = scriptText.slice(0, TITLE_PAGE_CHARACTERS).match(DATE)?.[0].replace(/\s+/g, ' ') ?? null;
	return { date };
};

module.exports = { earlyDraftOf };
