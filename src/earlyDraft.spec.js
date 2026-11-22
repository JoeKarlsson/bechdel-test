const { earlyDraftOf } = require('./earlyDraft');

describe('earlyDraftOf', () => {
	it('dates an early draft from its title page', () => {
		expect(earlyDraftOf('ALIEN III\n\nFirst Draft\n\nMarch 29, 1990\n\nINT. SHIP')).toEqual({ date: 'March 29, 1990' });
		expect(earlyDraftOf('DEATH NOTE\nEarly draft\nApril  2009\n')).toEqual({ date: 'April 2009' });
		expect(earlyDraftOf('BLADE\nFirst draft\n\nINT. HOSPITAL - 1967')).toEqual({ date: null });
		expect(earlyDraftOf('RYAN\nFirst draft\n\nFADE IN:\nSUPER: JUNE 6, 1944')).toEqual({ date: null });
	});

	it('leaves other scripts alone', () => {
		expect(earlyDraftOf('HEAT\nShooting Script\nMarch 1, 1995')).toBeNull();
		expect(earlyDraftOf('HEAT\nby Michael Mann')).toBeNull();
	});
});
