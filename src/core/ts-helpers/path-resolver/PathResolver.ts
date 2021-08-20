import upath from 'upath';
import fs from 'fs';
import { createMatchPath, loadConfig, MatchPath } from 'tsconfig-paths';
import { isPathRelative } from '../../utils/isPathRelative';
import { extensionsToResolve } from './constants';
import { libraryName } from '../../../constants/libraryName';

export class PathResolver {
    private static resolver: MatchPath;

    static init(): void {
        const config = loadConfig();

        if (config.resultType === 'failed') {
            throw new Error('Can not load tsconfig file');
        }

        PathResolver.resolver = createMatchPath(config.absoluteBaseUrl, config.paths);
    }

    static resolve(sourceFilePath: string, targetPath: string): string {
        if (targetPath === libraryName) {
            return targetPath;
        }

        const normalizedSourceFilePath = upath.toUnix(sourceFilePath);
        const normalizedTargetPath = upath.toUnix(targetPath);

        if (isPathRelative(normalizedTargetPath)) {
            const newSourceFilePath = upath.dirname(normalizedSourceFilePath);
            const resolved = upath.resolve(newSourceFilePath, normalizedTargetPath);

            return upath.normalize(resolved);
        }

        const resolved = PathResolver.resolver(
            normalizedTargetPath,
            undefined,
            undefined,
            extensionsToResolve,
        );

        if (resolved) {
            return upath.normalize(resolved);
        }

        const normalizedFromNodeModules = upath.normalize(upath.dirname(require.resolve(normalizedTargetPath)));
        const resolvedWithExtension = extensionsToResolve
            .map(it => upath.join(normalizedFromNodeModules, it))
            .find(it => fs.existsSync(it)) ?? normalizedTargetPath;

        return upath.normalize(resolvedWithExtension);
    }
}
