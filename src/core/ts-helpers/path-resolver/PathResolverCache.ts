import { PathResolver } from './PathResolver';
import upath from 'upath';
import { extensionsToResolve } from './constants';
import { FileSystem } from '../../../file-system/FileSystem';

export class PathResolverCache {
    private static cache: Record<string, string | undefined> = {};

    static getAbsolutePathWithExtension(sourceFilePath: string, targetPath: string): string {
        const resolved = PathResolver.resolve(sourceFilePath, targetPath);
        if(!upath.isAbsolute(resolved)) {
            return resolved;
        }

        const cached = this.cache[resolved];

        if (cached !== undefined) {
            return cached;
        }

        const candidatesFilePath = extensionsToResolve.map(it => upath.resolve(`${resolved}${it}`));

        if (extensionsToResolve.includes(upath.extname(resolved))) {
            candidatesFilePath.unshift(resolved);
        }

        const pathWithExtension = candidatesFilePath.find(it => FileSystem.exists(it));

        if (pathWithExtension === undefined) {
            throw new Error(`Can not resolve file ${targetPath}`);
        }

        this.cache[resolved] = pathWithExtension;

        return pathWithExtension;
    }

    static clearCache(): void {
        this.cache = {};
    }
}
