// Mock mockingoose for Jest tests
const mockingoose = {
    Model: jest.fn(() => ({
        toReturn: jest.fn(),
        reset: jest.fn(),
    })),
    resetAll: jest.fn(),
};

module.exports = mockingoose;
