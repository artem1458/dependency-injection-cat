import path from 'path';
import fs from 'fs';
import { createMatchPath, MatchPath, loadConfig } from 'tsconfig-paths';
import { isPathRelative } from '../../utils/isPathRelative';
import { CompilerOptionsProvider } from '../../compiler-options-provider/CompilerOptionsProvider';

const extensionsToResolve: Array<string> = [
    '.ts',
    '.tsx',
    '.d.ts',
    '/index.ts',
    '/index.tsx',
    '/index.d.ts',
];

export class PathResolver {
    private static resolver: MatchPath;

    static init(): void {
        const tsConfigPath = CompilerOptionsProvider.options.configFilePath as string;
        const config = loadConfig(tsConfigPath);

        if (config.resultType === 'failed') {
            throw new Error('Can not load tsconfig file');
        }

        PathResolver.resolver = createMatchPath(config.absoluteBaseUrl, config.paths);
    }

    static resolveWithoutExtension(sourceFilePath: string, targetPath: string): string {
        if (isPathRelative(targetPath)) {
            const newSourceFilePath = path.dirname(sourceFilePath);
            const resolved = path.resolve(newSourceFilePath, targetPath);

            return path.normalize(resolved);
        }

        const resolved = PathResolver.resolver(targetPath) ?? targetPath;

        return path.normalize(resolved);
    }

    //Use only for ts.createProgram!
    static resolveWithExtension(sourceFilePath: string, filePath: string): string {
        const withoutExt = this.resolveWithoutExtension(sourceFilePath, filePath);
        const filesPaths = extensionsToResolve.map(it => withoutExt + it);
        const resolved = filesPaths.find(it => fs.existsSync(it));

        if (resolved === undefined) {
            throw new Error(`Can not resolve file ${filePath}`);
        }

        return resolved;
    }
}
