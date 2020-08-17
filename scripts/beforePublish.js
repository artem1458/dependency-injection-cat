const fs = require('fs');
const path = require('path');
const beautify = require('json-beautify');
const { libraryName } = require('../src/constants/libraryName');

const packageJson = require('../package.json');
const newJson = {
    ...packageJson,
    name: libraryName,
    scripts: undefined,
};

fs.writeFileSync(path.resolve(__dirname, '../dist/src/package.json'), beautify(newJson, null, 2, 1));
