import path from 'path';
import { isPathRelative } from './isPathRelative';

export function absolutizePath(sourceFilePath: string, targetPath: string) {
    if (isPathRelative(targetPath)) {
        const newSourceFilePath = path.dirname(sourceFilePath);
        return path.resolve(newSourceFilePath, targetPath);
    }

    return targetPath;
}
