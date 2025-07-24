// Mock environment variables
process.env.GEMINI_API_KEY = 'test-key';
process.env.GOOGLE_MAPS_API_KEY = 'test-key';
process.env.DATABASE_URL = 'test-url';

// Mock the console to avoid noise in test output
global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  error: jest.fn(),
  // warn: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn(),
};

// Set up any global test configurations here
jest.setTimeout(10000); // 10 second timeout for all tests 