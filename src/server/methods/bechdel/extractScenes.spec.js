const extractScenes = require('./extractScenes');
const bechdelResults = require('./BechdelResults');
const movieScript = require('../__mocks__/mock-boyhood');

describe('extractScenes', () => {
	beforeEach(() => {
		bechdelResults.reset();
	});
	it('should return a function', () => {
		expect(typeof extractScenes).toBe('function');
	});

	it('should return an array of scenes', () => {
		const scenes = extractScenes(movieScript);
		const scene1 = scenes[0];
		const expectedScene1 = `BOYHOOD
Written by Richard Linklater
Boyhood Inc.
1901 E. 51st Street
Austin, TX 78723
512.322.0031
`;
		expect(scene1).toBe(expectedScene1);
		const scene2 = scenes[2];
		const expectedScene2 = `INT. CAR - DAY Driving...
MOM
So how was your day at school?
Fine.
MASON
MOM
Hey, I had a good meeting with Miss
Butler this time. I kinda liked her.
MASON What did she say?
MOM
Well... she said that you weren't
turning in your homework assignments. And I told her, "I know he does them, 'cause I check them every night." She said she found a big chunk of them crumpled up at the bottom of your backpack.
MASON
She didn't ask for 'em.
MOM
Well, baby, she doesn't have to.
You're supposed to turn them in. And she said you're still staring out the window all day.
MASON Not all day.
MOM
And she said that you destroyed her
pencil sharpener.
MASON Not on purpose.
MOM
Wait, she said that you crammed a
bunch of rocks in it.
MASON
I thought if it could sharpen pencils,
maybe we could sharpen rocks.
MOM (stifling laugh)
Well, what were you gonna do with a bunch of sharpened rocks?
MASON
I was trying to make arrowheads for
my rock collection.
MOM
Hm.
`;
		expect(scene2).toBe(expectedScene2);
	});
});
