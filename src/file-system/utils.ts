import glob, { IOptions } from 'glob';

export function globAsync(pattern: string, options: IOptions): Promise<string[]> {
    return new Promise((resolve, reject) => {
        glob(pattern, options, (err, matches) => {
            if (err !== null) {
                reject(err);
            } else {
                resolve(matches);
            }
        });
    });
}
