const {
	PORT,
	NODE_ENV,
} = process.env;

const isDeveloping = NODE_ENV !== 'production';

const isTest = NODE_ENV === 'test';

const port = isDeveloping ? 3000 : PORT;

module.exports = {
	isDeveloping,
	isTest,
	port,
};
