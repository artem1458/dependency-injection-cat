import path from 'path';
import { escapeRegExp } from 'lodash';

export function removeExtensionFromPath(oldPath: string): string {
    const ext = path.extname(oldPath);
    if (ext === '') {
        return oldPath;
    }

    const regexp = new RegExp(`${escapeRegExp(ext)}$`, 'g');

    return oldPath.replace(regexp, '');
}
