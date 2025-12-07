export default {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  setupFiles: ["./jest.setup.js"],

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],

  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
  },

  // REMOVE `.js` here to fix the error
  extensionsToTreatAsEsm: [".jsx"],

  transformIgnorePatterns: [
    "node_modules/(?!(lucide-react|axios)/)"
  ]
};
