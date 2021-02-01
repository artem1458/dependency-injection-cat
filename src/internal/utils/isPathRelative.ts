import { escapeRegExp } from 'lodash';

const relativeRegexp = new RegExp(`^..?${escapeRegExp('/')}`);

export function isPathRelative(filePath: string): boolean {
    return relativeRegexp.test(filePath);
}
