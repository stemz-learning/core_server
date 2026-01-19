jest.setTimeout(30000);

// Set dummy environment variables for tests
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-test-dummy-key-for-testing';
process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '12345678';
process.env.NODE_ENV = 'test';
