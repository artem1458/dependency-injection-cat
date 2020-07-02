const path = require('path');

module.exports = {
  testMatch: ['**/+(*.)+(test).+(ts|js)'],
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  setupFilesAfterEnv: ["jest-sinon"],
  transformIgnorePatterns: ['/node_modules/'],
  resolver: path.resolve(__dirname, 'scripts/jest-resolver.js'),
  moduleFileExtensions: ['ts', 'js'],
  coverageReporters: ['html'],
  globals: {
    'ts-jest': {
      compiler: 'ttypescript',
    }
  },
  cacheDirectory: './test/.jest-cache',
  reporters: [
    'default',
  ],
};
