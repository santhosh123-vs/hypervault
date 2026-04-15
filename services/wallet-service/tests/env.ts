// This runs BEFORE any module imports — sets required env vars for testing
process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests-only';
process.env.MASTER_ENCRYPTION_KEY = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4';
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
