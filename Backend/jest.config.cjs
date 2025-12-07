// jest.config.cjs
module.exports = {
  // Specify the environment where tests will run (Node for backend)
  testEnvironment: 'node',

  // The directories Jest should look into for test files
  roots: ['<rootDir>'],
  
  // The pattern to detect test files (e.g., files ending in .test.js or .spec.js)
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // ✅ NEW: Ensure .js is handled correctly
  moduleFileExtensions: ['js', 'json', 'node', 'mjs'], 

  // ✅ NEW: Map module imports if needed (e.g., using Babel for aliases)
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Optional: Add coverage collection
  collectCoverage: true,
  
  // ✅ NEW: Add transform to handle ES Module syntax (import/export)
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // Directories to ignore for coverage
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/config/', // Ignore config files
    '/middleware/', // Ignore simple middleware unless heavily tested
  ],
  
  // Where to store coverage reports
  coverageDirectory: 'coverage',

  // ✅ ADD the globalSetup line pointing to the new file
  globalSetup: '<rootDir>/globalsetup.cjs',

  testTimeout: 20000, // Should apply globally, but we'll keep the direct hook timeouts as a failsafe
  // NOTE: This requires 'dotenv' package to be installed in your Backend directory
  // and will load variables from a .env file (you may need to specify .env.test)
  
  // Optional: Stop running tests after the first failure
  bail: false,

  // Optional: Allow Jest to find modules that are not specified in the package.json dependencies
  modulePaths: ['<rootDir>/node_modules'],
};