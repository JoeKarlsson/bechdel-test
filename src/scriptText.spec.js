const { fixMojibake, cleanScriptText } = require('./scriptText');

describe('scriptText', () => {
	it('repairs UTF-8 that was read as Windows-1252', () => {
		expect(fixMojibake('donâ€™t go to the cafÃ© â€” ever')).toBe('don’t go to the café — ever');
		// An Ã that starts no UTF-8 sequence is left alone; Â£ is a broken £
		expect(fixMojibake('Ã  la carte, Â£5')).toBe('Ã  la carte, £5');
	});

	it('turns page breaks into line breaks and drops watermark lines', () => {
		const raw = 'MARY\r\n    Hello.\f\n8FLiX.com SCREENPLAY DATABASE 12\n== Script Fly.com ==     (CONTINUED)\nJOHN   \n';
		expect(cleanScriptText(raw)).toBe('MARY\n    Hello.\n\n     (CONTINUED)\nJOHN\n');
	});
});
