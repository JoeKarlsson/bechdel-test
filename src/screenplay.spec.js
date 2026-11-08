const { parseScreenplay, normalizeSpeaker } = require('./screenplay');
const { resolveSpeakers } = require('./genders');
const { scoreBechdel } = require('./bechdel/score');

const indented = `
INT. NOSTROMO - BRIDGE - NIGHT

          Ripley studies the nav console. Lambert leans in beside her.

                              RIPLEY
                    Did you check the beacon?

                              LAMBERT (CONT'D)
                    Twice. It's a distress call.

                              RIPLEY
                         (beat)
                    Then we answer it.

          Dallas enters. He looks at the screen.

                              DALLAS
                    Strap in.

EXT. PLANET SURFACE - DAY

          Wind howls.
`;

const dialogueOf = screenplay => screenplay.scenes.flatMap(s => s.blocks).filter(b => b.kind === 'dialogue');

describe('parseScreenplay', () => {
	it('reads scenes, speakers and dialogue from an indented script, dropping parentheticals', () => {
		const screenplay = parseScreenplay(indented);
		expect(screenplay.layout).toBe('indented');
		expect(screenplay.scenes.map(s => s.heading)).toEqual(['INT. NOSTROMO - BRIDGE - NIGHT', 'EXT. PLANET SURFACE - DAY']);
		expect(dialogueOf(screenplay)).toEqual([
			{ kind: 'dialogue', speaker: 'RIPLEY', text: 'Did you check the beacon?' },
			{ kind: 'dialogue', speaker: 'LAMBERT', text: "Twice. It's a distress call." },
			{ kind: 'dialogue', speaker: 'RIPLEY', text: 'Then we answer it.' },
			{ kind: 'dialogue', speaker: 'DALLAS', text: 'Strap in.' },
		]);
	});

	it('reads a flattened script where names share a line with their first words', () => {
		const flat = 'NICK\nWhose beer is this?\nAMY\nMine.\nNICK (CONT’D) Fair enough.\nHe drinks it anyway.\n';
		expect(dialogueOf(parseScreenplay(flat)).map(d => `${d.speaker}: ${d.text}`)).toEqual([
			'NICK: Whose beer is this?',
			'AMY: Mine.',
			'NICK: Fair enough. He drinks it anyway.',
		]);
	});

	it('does not split scenes on words that merely contain INT or EXT', () => {
		const text = '          The NEXT morning she reads the TEXT again.\n\n                    ANN\n          Interesting.\n';
		expect(parseScreenplay(text).scenes).toHaveLength(1);
	});

	it("reads names that aren't all caps where the script's names sit", () => {
		// Coen-style "Tom" and small-caps "verna", repeated so the name column can be learned
		const exchange = '     Tom pours a drink and sits down across from her.\n\n                           Tom\n          What do you want?\n\n                           verna  (off)\n          Nothing from you.\n\n';
		const speakers = dialogueOf(parseScreenplay(exchange.repeat(20))).map(d => d.speaker);
		expect(new Set(speakers)).toEqual(new Set(['TOM', 'VERNA']));
		expect(speakers).toHaveLength(40);
	});

	it('reads names sitting exactly 8 right of the action when that is where all the names sit, but not shots at +8 elsewhere', () => {
		// Runaway Bride's layout: action at 2, dialogue at 4, names at 10
		const exchange = '  Ike leans on the bar, watching the woman throw darts at the board.\n          WOMAN\n    That\'s flattering.\n          IKE\n    No, you don\'t understand.\n';
		expect(dialogueOf(parseScreenplay(exchange.repeat(20)))).toHaveLength(40);
		// Names further right: a shot at +8 stays a direction
		const shot = '  Kevin runs down the long hallway toward the hotel elevator doors.\n                    KEVIN\n          Wait for me!\n          CU. KEVIN\n    He presses the button.\n';
		expect(new Set(dialogueOf(parseScreenplay(shot.repeat(20))).map(d => d.speaker))).toEqual(new Set(['KEVIN']));
	});

	it('reads transcripts that put "Name:" alone on a line, and small-caps "name:" inline', () => {
		const transcript = 'Bert:\nNumber 17.\nAdmiral Boom:\nEnter that in the log.\n[He salutes.]\n'.repeat(3);
		expect(dialogueOf(parseScreenplay(transcript)).slice(0, 2)).toEqual([
			{ kind: 'dialogue', speaker: 'BERT', text: 'Number 17.' },
			{ kind: 'dialogue', speaker: 'ADMIRAL BOOM', text: 'Enter that in the log.' },
		]);
		const inline = '            bono:   I’m like you.\n            troy:   You ain’t.\n'.repeat(3);
		expect(dialogueOf(parseScreenplay(inline)).map(d => d.speaker)).toEqual(['BONO', 'TROY', 'BONO', 'TROY', 'BONO', 'TROY']);
	});

	it('reads "ANGLE ON:", "DRAFT:" and "Continued:" lines as directions, not speakers', () => {
		const directions = [
			'ANGLE ON: SMEAGOL leaning over the boat.',
			'DRAFT: 01.05.16',
			'     Continued: 3',
			'                              RIPLEY',
			'                    Did you check the beacon?',
			'',
		].join('\n');
		const screenplay = parseScreenplay(`INT. SHIP - DAY\n\n${directions.repeat(3)}`);
		expect([...new Set(dialogueOf(screenplay).map(d => d.speaker))]).toEqual(['RIPLEY']);
	});

	it('drops running page headers and camera directions however they are written', () => {
		const page = n => [
			`HTTYD: The Hidden World - 12/05/18 - Final (DeBlois)      ${n}.`,
			'          ANGLES ON: Hiccup at the cliff edge.',
			'          A',
			'           NGLE ON: Astrid watching.',
			'                              ASTRID',
			'                    Are you coming?',
			'',
		].join('\n');
		const screenplay = parseScreenplay(`INT. CAVE - DAY\n\n${[1, 2, 3, 4, 5, 6].map(page).join('\n')}`);
		expect([...new Set(dialogueOf(screenplay).map(d => d.speaker))]).toEqual(['ASTRID']);
	});

	it('cleans speaker extensions', () => {
		expect(normalizeSpeaker('JAKE (V.O.)')).toBe('JAKE');
		expect(normalizeSpeaker("BONNIE'S VOICE")).toBe('BONNIE');
	});
});

describe('resolveSpeakers', () => {
	const cast = [
		{ character: 'Ellen Ripley', gender: 1 },
		{ character: 'Joan Lambert', gender: 1 },
		{ character: 'Dallas', gender: 2 },
		{ character: 'Mr. Smith', gender: 2 },
		{ character: 'Mrs. Smith', gender: 1 },
	];
	const action = 'Then Ripley turns to the console and Lambert follows. A Waitress pours coffee; she smiles at him. The waitress laughs and her tray tips. She waves.';

	it('matches speakers to the cast by first or last name, and by gendered titles', () => {
		const resolved = resolveSpeakers(['RIPLEY', 'LAMBERT', 'DALLAS', 'MRS. SMITH', 'WAITRESS', 'SMITH'], cast, action);
		expect(resolved.get('RIPLEY')).toMatchObject({ gender: 'w', source: 'cast', named: true });
		expect(resolved.get('DALLAS')).toMatchObject({ gender: 'm', source: 'cast' });
		expect(resolved.get('MRS. SMITH')).toMatchObject({ gender: 'w' });
		expect(resolved.get('WAITRESS')).toMatchObject({ gender: 'w', source: 'title', named: false });
		// Mr. and Mrs. Smith share the name, so SMITH alone stays unknown
		expect(resolved.get('SMITH').gender).toBeNull();
	});
});

describe('scoreBechdel', () => {
	const cast = [
		{ character: 'Ellen Ripley', gender: 1 },
		{ character: 'Joan Lambert', gender: 1 },
		{ character: 'Dallas', gender: 2 },
	];
	const action = 'Then Ripley turns to the console and Lambert follows her.';
	const score = script => {
		const screenplay = parseScreenplay(script);
		const speakers = [...new Set(dialogueOf(screenplay).map(d => d.speaker))];
		return scoreBechdel(screenplay, resolveSpeakers(speakers, cast, action), cast);
	};
	const scene = lines => `INT. SHIP - DAY\n\n${lines.map(([who, said]) => `                    ${who}\n          ${said}\n`).join('\n')}`;

	it('passes two named women talking about something other than a man', () => {
		expect(score(scene([['RIPLEY', 'Did you check the beacon?'], ['LAMBERT', 'Twice.']])).bechdelScore).toBe(3);
	});

	it('scores 2 when every conversation between them mentions a man', () => {
		expect(score(scene([['RIPLEY', 'Where is Dallas?'], ['LAMBERT', 'With the cat.']])).bechdelScore).toBe(2);
		expect(score(scene([['RIPLEY', 'Is he coming?'], ['LAMBERT', 'No.']])).bechdelScore).toBe(2);
	});

	it("doesn't treat words like Hello or Her as being about a man", () => {
		expect(score(scene([['RIPLEY', 'Hello. Her shift is over.'], ['LAMBERT', 'Help me with this.']])).bechdelScore).toBe(3);
	});

	it('scores 1 when the women never talk to each other, and 0 with fewer than two', () => {
		expect(score(scene([['RIPLEY', 'Hi.'], ['DALLAS', 'Hi.'], ['LAMBERT', 'Hi.']])).bechdelScore).toBe(1);
		expect(score(scene([['RIPLEY', 'Hi.'], ['DALLAS', 'Hi.']])).bechdelScore).toBe(0);
	});
});
