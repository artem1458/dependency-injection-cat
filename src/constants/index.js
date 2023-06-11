const upath = require('upath');

module.exports = {
    CONSTANTS: {
        libraryName: 'dependency-injection-cat',
        packageRootDir: upath.resolve(__dirname, '../'),
    },
};

if (process.env.DICAT_DEBUG_MODE === 'true') {
    module.exports.CONSTANTS.packageRootDir = upath.join(__dirname, '../../debug/node_modules/dependency-injection-cat');
}
