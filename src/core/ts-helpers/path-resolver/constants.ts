import upath from 'upath';

export const extensionsToResolve: Array<string> = [
    '.ts',
    '.tsx',
    '.d.ts',
    '.js',
    '.jsx',
    `${upath.sep}index.ts`,
    `${upath.sep}index.tsx`,
    `${upath.sep}index.d.ts`,
    `${upath.sep}index.js`,
    `${upath.sep}index.jsx`,
];
