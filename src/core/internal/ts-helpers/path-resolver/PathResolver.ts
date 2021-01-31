import path from 'path';
import { createMatchPath, loadConfig, MatchPath } from 'tsconfig-paths';
import { isPathRelative } from '../../utils/isPathRelative';
import { TsConfigProvider } from '../../ts-config-path-provider/TsConfigProvider';
import { extensionsToResolve } from './constants';

export class PathResolver {
    private static resolver: MatchPath;

    static init(): void {
        const config = loadConfig(TsConfigProvider.tsConfigPath);

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

        const resolved = PathResolver.resolver(
            targetPath,
            undefined,
            undefined,
            extensionsToResolve,
        ) ?? targetPath;

        return path.normalize(resolved);
    }
}
