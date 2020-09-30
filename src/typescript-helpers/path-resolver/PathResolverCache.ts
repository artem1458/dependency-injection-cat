import { PathResolver } from './PathResolver';
import path from 'path';
import fs from 'fs';
import { extensionsToResolve } from './constants';

export class PathResolverCache {
    private static cache: Record<string, string | undefined> = {};

    static getAbsolutePathWithExtension(sourceFilePath: string, targetPath: string): string {
        const resolved = PathResolver.resolveWithoutExtension(sourceFilePath, targetPath);
        if(!path.isAbsolute(resolved)) {
            return resolved;
        }

        const cached = this.cache[resolved];

        if (cached !== undefined) {
            return cached;
        }

        const candidatesFilePath = extensionsToResolve.map(it => path.resolve(`${resolved}${it}`));

        const pathWithExtension = candidatesFilePath.find(it => fs.existsSync(it));

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
