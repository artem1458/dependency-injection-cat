import path from 'path';
import { escapeRegExp } from 'lodash';

const relativeRegexp = new RegExp(`^\.\.?${escapeRegExp(path.sep)}`);

export function isPathRelative(filePath: string): boolean {
    return relativeRegexp.test(filePath);
}
