const upath = require('upath');

module.exports = {
    CONSTANTS: {
        libraryName: 'dependency-injection-cat',
        packageRoot: upath.resolve(__dirname, '../index.d.ts'),
        packageRootDir: upath.resolve(__dirname, '../'),
    },
};

if (process.env.DICAT_DEBUG_MODE === 'true') {
    module.exports.CONSTANTS.packageRoot = upath.join(process.cwd(), '../dist/index.d.ts');
    module.exports.CONSTANTS.packageRootDir = upath.join(process.cwd(), '../dist');
}
