// MongoDB initialization script
db = db.getSiblingDB('bechdelTest');

// Create a user for the application
db.createUser({
    user: 'bechdeluser',
    pwd: 'bechdelpass',
    roles: [
        {
            role: 'readWrite',
            db: 'bechdelTest'
        }
    ]
});

// Create initial collections if needed
db.createCollection('films');
db.createCollection('scripts');

print('MongoDB initialization completed');
