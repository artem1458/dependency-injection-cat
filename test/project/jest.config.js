const path = require('path');

module.exports = {
  testMatch: ['**/+(*.)+(test).+(ts|js)'],
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  setupFilesAfterEnv: ["jest-sinon"],
  transformIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'js'],
  coverageReporters: ['html'],
  globals: {
    'ts-jest': {
      compiler: 'ttypescript',
      tsConfig: './tsconfig.test.json',
    }
  },
  cacheDirectory: './test/.jest-cache',
  reporters: [
    'default',
  ],
};
