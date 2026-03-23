// Mock mockingoose for Jest tests
const createModelMock = () => ({
    toReturn: jest.fn().mockReturnThis(),
    reset: jest.fn(),
});

const mockingoose = {
    Model: createModelMock(),
    Film: createModelMock(),
    resetAll: jest.fn(),
};

// Allow dynamic model access
const handler = {
    get: function(target, prop) {
        if (prop in target) {
            return target[prop];
        }
        // Create a new mock for any model accessed
        target[prop] = createModelMock();
        return target[prop];
    }
};

module.exports = new Proxy(mockingoose, handler);
