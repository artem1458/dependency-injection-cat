import fs from 'fs';
import path from 'path';
import { srcDirname } from '../srcDirname';

export function getLibraryName(): string {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(srcDirname, '../package.json'), 'utf-8'));
    return packageJson.name;
}
