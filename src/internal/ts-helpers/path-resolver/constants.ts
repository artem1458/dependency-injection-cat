import path from 'path';

export const extensionsToResolve: Array<string> = [
    '.ts',
    '.tsx',
    '.d.ts',
    '.js',
    '.jsx',
    `${path.sep}index.ts`,
    `${path.sep}index.tsx`,
    `${path.sep}index.d.ts`,
    `${path.sep}index.js`,
    `${path.sep}index.jsx`,
];
