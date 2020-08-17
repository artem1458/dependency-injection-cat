import fs from 'fs';
import { getFactoriesListPath } from './utils/getFactoriesListPath';

let wasInitialised = false;

export function clearFactoriesDir(): void {
    if (wasInitialised) {
        return;
    }
    wasInitialised = true;

    fs.rmdirSync(getFactoriesListPath(), { recursive: true });
    fs.mkdirSync(getFactoriesListPath());
}
