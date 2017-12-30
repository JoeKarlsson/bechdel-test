const helper = require('./helper');
const mockData = require('../../getFilmData/__mocks__/mock-film-data');

const {
	countCharacterDialouge,
	isCharFemale,
	containsPatriarchalKeywords,
	twoOrMoreFemalesInScene,
	bechdelTestPass,
} = helper;

const sceneBechdelFail = `INT. CAR - DAY Driving...
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

const sceneBechdelFailCount = {
	MASON: 7,
	MOM: 8,
};

const sceneBechdelPass = `INT. KID'S BEDROOM - EARLY MORNING
Mason is comfortably asleep. Samantha slowly pulls the pillow out from underneath his head and smacks him with it.
SAMANTHA (singing)
"Oops, I did it again... I played with your heart. Got lost in the game. Oh baby, baby..."
Mason throws a stuffed animal at her that she deflects.
SAMANTHA (CONT'D) "Oops, you think I'm in love. I'm
sent from above. I'm not that innocent."
Another stuffed animal. She continues to sing.
MASON (O.S.) Stop! Quit it!
SAMANTHA
"You see my problem is this. I'm
dreaming away. Wishing that heroes truly exist. I cry watching the day. Can't you see I'm a fool in so many ways..."
MASON Quit! Mom!
SAMANTHA
"But to lose all my senses-- that
is..."
MOM
What the hell is going on in here?!
Samantha has instantaneously shifted from singing to crying.
MOM (O.S.) (CONT'D) Do you guys know what time it is?
7.
SAMANTHA (through tears/sobs)
MOM
Mason! Do not throw things at your
sister!
MASON
She's faking, she hit me first!!
MOM
Listen, both of you! I am going
back to bed. I don't wanna hear another peep out of here for an hour. Go to sleep.
Mom slams the door behind her. Samantha is suddenly fine, almost cheerful.
MASON (to Samantha)
Faker!
`;

const sceneBechdelPassCount = {
	MASON: 4,
	MOM: 4,
	SAMANTHA: 5,
};

describe('Script Analysis Helper Methods', () => {
	describe('#isCharFemale', () => {
		it('should return false if the character is not a female', () => {
			const characters = mockData.actors;
			const name = 'MASON';
			const result = isCharFemale(characters, name);
			expect(result).toBe(false);
		});
		it('should return true if the character is a female', () => {
			const characters = mockData.actors;
			const name = 'MOM';
			const result = isCharFemale(characters, name);
			expect(result).toBe(true);
		});
	});

	describe('#countCharacterDialouge', () => {
		it('should return an object with all of the characters in the movie and the number times they talk in a given scene', () => {
			const characters = mockData.actors;
			const result1 = countCharacterDialouge(characters, sceneBechdelFail);
			expect(result1).toMatchObject(sceneBechdelFailCount);

			const result2 = countCharacterDialouge(characters, sceneBechdelPass);
			expect(result2).toMatchObject(sceneBechdelPassCount);
		});
	});

	describe('#containsPatriarchalKeywords', () => {
		it('should return true if a scene has any patriachal keywords', () => {
			const result = containsPatriarchalKeywords(sceneBechdelFail);
			expect(result).toBe(true);
		});

		it('should return false if a scene contains a patriachal keyword', () => {
			const result = containsPatriarchalKeywords(sceneBechdelPass);
			expect(result).toBe(false);
		});
	});

	describe('#twoOrMoreFemalesInScene', () => {
		it('should return false if a scene does not have two or more female characters', () => {
			const characters = mockData.actors;

			const result = twoOrMoreFemalesInScene(characters, sceneBechdelFailCount);
			expect(result).toBe(false);
		});

		it('should return true if a scene has two or more female characters', () => {
			const characters = mockData.actors;

			const result = twoOrMoreFemalesInScene(characters, sceneBechdelPassCount);
			expect(result).toBe(true);
		});
	});

	describe('#bechdelTestPass', () => {
		it('should return false if a given scene does not pass the bechdel test', () => {
			const characters = mockData.actors;
			const sceneData = {
				characters,
				count: sceneBechdelFailCount,
				scene: sceneBechdelFail,
			};
			const result = bechdelTestPass(sceneData);
			expect(result).toBe(false);
		});

		it('should return true if a given scene does not pass the bechdel test', () => {
			const characters = mockData.actors;
			const sceneData = {
				characters,
				count: sceneBechdelPassCount,
				scene: sceneBechdelPass,
			};
			const result = bechdelTestPass(sceneData);
			expect(result).toBe(true);
		});
	});
});
