import fs from 'fs';
import path from 'path';

// TODO Needs to use nearest to file tsconfig file
export function getTsConfigPaths(baseConfigPath: string): Record<string, Array<string>> | undefined {
    const file = fs.readFileSync(baseConfigPath, { encoding: 'utf-8' });
    const tsConfig = JSON.parse(file);
    const paths = tsConfig?.compilerOptions.paths;
    const extendz = tsConfig.extends;

    if (paths === undefined && extendz === undefined) {
        return undefined;
    }

    if (paths === undefined && extendz !== undefined) {
        if (path.isAbsolute(extendz)) {
            return getTsConfigPaths(extendz)
        }

        const newPath = path.resolve(path.dirname(baseConfigPath), extendz);

        return getTsConfigPaths(newPath);
    }


    return paths;
}
