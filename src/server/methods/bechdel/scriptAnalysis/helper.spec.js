const helper = require('./helper');
const mockData = require('../../getFilmData/__mocks__/mock-film-data');
const mockMovieScript = require('../../__mocks__/mock-boyhood');

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

const wholeScriptCount = {
	MASON: 452,
	MOM: 276,
	TOMMY: 7,
	SAMANTHA: 217,
	TED: 19,
	TEACHER: 19,
	'ELEMENTARY SCHOOL GIRL': 0,
	GRANDMA: 42,
	DAD: 368,
	'PROFESSOR BILL WELBROCK': 0,
	MINDY: 23,
	RANDY: 24,
	'NEIGHBORHOOD FRIEND #1': 0,
	'NEIGHBORHOOD FRIEND #2': 0,
	PAUL: 2,
	'BOOK TRIVIA JUDGE': 1,
	'BOOK RELEASE EMCEE': 0,
	JIMMY: 15,
	BARBER: 1,
	"MASON'S 4TH GRADE TEACHER": 0,
	'LIQUOR STORE CLERK': 0,
	CAROL: 15,
	LEE: 1,
	ABBY: 3,
	KENNY: 3,
	'MRS. DARBY': 7,
	'NO OBAMA MAN': 0,
	'OBAMA MAMA': 0,
	TAMMY: 13,
	TONY: 15,
	'BULLY 1': 0,
	'BULLY 2': 0,
	JILL: 20,
	JIM: 54,
	'COLLEGE GIRL SINGER': 0,
	GABI: 0,
	CHASE: 15,
	CHARLIE: 20,
	"CHARLIE'S FRIEND": 0,
	'PROFESSOR DOUGLAS': 16,
	'MAKE OUT GIRL': 0,
	ANNIE: 35,
	COOPER: 1,
	ENRIQUE: 0,
	'GRANDPA CLIFF': 20,
	NANA: 12,
	PASTOR: 0,
	'MR. TURLINGTON': 1,
	NICK: 16,
	'BEER PONG GUY': 1,
	'HIGH SCHOOL BAND SINGER': 0,
	SHEENA: 69,
	APRIL: 5,
	"MASON'S BOSS": 0,
	"SAM'S COLLEGE BOYFRIEND": 0,
	HOOPER: 0,
	'GUITAR PLAYER': 0,
	'BEAT BOX': 0,
	'BAND MEMBER 1': 0,
	'BAND MEMBER 2': 0,
	'BAND MEMBER 3': 0,
	'BAND MEMBER 4': 0,
	'GUY IN DINER': 0,
	"SAM'S ROOMMATE": 0,
	'HIGH SCHOOL TEACHER': 0,
	'UNCLE STEVE': 11,
	'TWIN COUSIN 1': 0,
	'TWIN COUSIN 2': 0,
	'WOMAN AT PARTY': 1,
	"JIMMY'S BANDMATE 1": 0,
	"JIMMY'S BANDMATE 2": 0,
	"JIMMY'S BANDMATE 3": 0,
	DALTON: 15,
	BARB: 7,
	NICOLE: 21,
	'PATRON IN RESTAURANT': 0,
	STUDENT: 2,
	'HIMSELF -- HOUSTON CATCHER': 0,
	'ADDITIONAL VOICES': 0,
	'KITCHEN WORKER': 0,
	'COLLEGE STUDENT': 0,
	'MAN IN RESTAURANT': 0,
	'ROGER CLEMENS': 0,
	'QUESO WAITRESS': 0,
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

		it('should be able to handle an entire movie script', () => {
			const characters = mockData.actors;
			const result = countCharacterDialouge(characters, mockMovieScript);
			expect(result).toMatchObject(wholeScriptCount);
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
