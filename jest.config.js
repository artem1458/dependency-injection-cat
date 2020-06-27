const path = require('path');

module.exports = {
  testMatch: ['**/+(*.)+(test).+(ts|js)'],
  transform: {
    '^.+\\.(ts|js|tsx|jsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
  resolver: path.resolve(__dirname, 'scripts/jest-resolver.js'),
  moduleFileExtensions: ['ts', 'js', 'tsx', 'jsx'],
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
