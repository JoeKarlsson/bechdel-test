// Mock Mongoose for Jest tests
const mongoose = {
    connect: jest.fn(() => Promise.resolve()),
    disconnect: jest.fn(() => Promise.resolve()),
    connection: {
        on: jest.fn(),
        once: jest.fn(),
        close: jest.fn(),
    },
    Schema: jest.fn(() => {
        const schema = {
            pre: jest.fn(),
            post: jest.fn(),
            methods: {},
            statics: {},
            static: jest.fn((name, fn) => {
                schema.statics[name] = fn;
                return schema;
            }),
        };
        return schema;
    }),
    model: jest.fn(() => ({
        find: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        updateOne: jest.fn(),
        updateMany: jest.fn(),
        deleteOne: jest.fn(),
        deleteMany: jest.fn(),
        aggregate: jest.fn(),
        countDocuments: jest.fn(),
        estimatedDocumentCount: jest.fn(),
    })),
    Types: {
        ObjectId: jest.fn(),
    },
};

module.exports = mongoose;
