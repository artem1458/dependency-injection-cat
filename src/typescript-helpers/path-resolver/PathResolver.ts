import path from 'path';
import { createMatchPath, MatchPath, loadConfig } from 'tsconfig-paths';
import { isPathRelative } from '../../utils/isPathRelative';
import { CompilerOptionsProvider } from '../../compiler-options-provider/CompilerOptionsProvider';

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

    //Transform to absolute path, only if it's relative or aliased by paths defined in tsConfig.json
    static resolve(sourceFilePath: string, targetPath: string): string {
        if (isPathRelative(targetPath)) {
            const newSourceFilePath = path.dirname(sourceFilePath);
            return path.resolve(newSourceFilePath, targetPath);
        }

        return PathResolver.resolver(targetPath) ?? targetPath;
    }
}
