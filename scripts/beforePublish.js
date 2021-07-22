const fs = require('fs');
const path = require('path');
const beautify = require('json-beautify');
const { libraryName } = require('../src/constants/libraryName');

const readmeMd = fs.readFileSync(path.resolve(__dirname, '../README.md'));
const changelogMd = fs.readFileSync(path.resolve(__dirname, '../CHANGELOG.md'));
const packageJson = require('../package.json');
const newJson = {
    ...packageJson,
    name: libraryName,
    scripts: undefined,
    devDependencies: undefined,
};

fs.writeFileSync(path.resolve(__dirname, '../dist/package.json'), beautify(newJson, null, 2, 1));
fs.writeFileSync(path.resolve(__dirname, '../dist/README.md'), readmeMd);
fs.writeFileSync(path.resolve(__dirname, '../dist/CHANGELOG.md'), changelogMd);
