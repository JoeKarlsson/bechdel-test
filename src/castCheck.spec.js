const { speakersInCast } = require('./castCheck');

describe('speakersInCast', () => {
	const script = [
		'INT. CAFE - NIGHT', '',
		'                    RICK', '          Here\'s looking at you.', '',
		'                    ILSA', '          Play it, Sam.', '',
		'                    MR. FERRARI', '          A drink?', '',
		'                    RICK', '          Not tonight.', '',
	].join('\n');

	it('finds the speakers named in the cast, matching on a shared word', () => {
		const cast = [{ character: 'Rick Blaine' }, { character: 'Ilsa Lund' }, { character: 'Signor Ferrari' }];
		expect(speakersInCast(script, cast).sort()).toEqual(['ILSA', 'MR. FERRARI', 'RICK']);
	});

	it('finds none for a different film with the same title', () => {
		expect(speakersInCast(script, [{ character: 'Mr. Smith' }, { character: 'The Doctor' }])).toEqual([]);
	});
});
