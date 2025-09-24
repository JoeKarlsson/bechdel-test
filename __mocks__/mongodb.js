// Mock MongoDB for Jest tests
const mongodb = {
    MongoClient: jest.fn(() => ({
        connect: jest.fn(() => Promise.resolve()),
        close: jest.fn(() => Promise.resolve()),
        db: jest.fn(() => ({
            collection: jest.fn(() => ({
                find: jest.fn(),
                findOne: jest.fn(),
                insertOne: jest.fn(),
                insertMany: jest.fn(),
                updateOne: jest.fn(),
                updateMany: jest.fn(),
                deleteOne: jest.fn(),
                deleteMany: jest.fn(),
                aggregate: jest.fn(),
                countDocuments: jest.fn(),
            })),
        })),
    })),
    ObjectId: jest.fn(),
};

module.exports = mongodb;
