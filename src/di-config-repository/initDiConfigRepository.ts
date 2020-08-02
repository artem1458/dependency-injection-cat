import glob from 'glob';
import { transformerConfig } from '../transformer-config';
import { diConfigRepository } from './repository';

let initialized: boolean = false;

export const initDiConfigRepository = (): void => {
    const { configPattern, ignorePatterns } = transformerConfig;

    if (initialized) {
        return;
    }

    if (!configPattern) {
        throw new Error('DI Config pattern is empty, please check plugin configuration');
    }

    initialized = true;

    const configPaths = glob.sync(configPattern, { absolute: true, ignore: ignorePatterns });

    configPaths.forEach(path => diConfigRepository.push(path));
};
