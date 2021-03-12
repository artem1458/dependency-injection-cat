import upath from 'upath';
import { escapeRegExp } from 'lodash';

export function removeExtensionFromPath(oldPath: string): string {
    const ext = upath.extname(oldPath);
    if (ext === '') {
        return oldPath;
    }

    const regexp = new RegExp(`${escapeRegExp(ext)}$`, 'g');

    return oldPath.replace(regexp, '');
}
