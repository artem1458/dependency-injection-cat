import path from 'upath';
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

    static resolve(sourceFilePath: string, targetPath: string): string {
        const normalizedSourceFilePath = path.toUnix(sourceFilePath);
        const normalizedTargetPath = path.toUnix(targetPath);

        if (isPathRelative(normalizedTargetPath)) {
            const newSourceFilePath = path.dirname(normalizedSourceFilePath);
            const resolved = path.resolve(newSourceFilePath, normalizedTargetPath);

            return path.normalize(resolved);
        }

        const resolved = PathResolver.resolver(
            normalizedTargetPath,
            undefined,
            undefined,
            extensionsToResolve,
        ) ?? normalizedTargetPath;

        return path.normalize(resolved);
    }
}
