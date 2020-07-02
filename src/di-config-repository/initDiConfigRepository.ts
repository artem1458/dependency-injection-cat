import glob from 'glob';
import fs from 'fs';
import { transformerConfig } from '../transformer-config';
import { diConfigRepository } from './repository';

let initialized: boolean = false;

export const initDiConfigRepository = (): void => {
    const { configPattern } = transformerConfig;

    if (initialized) {
        return;
    }

    if (!configPattern) {
        throw new Error('DI Config pattern is empty, please check plugin configuration');
    }

    initialized = true;
    const configPaths = glob.sync(configPattern, { absolute: true });
    const filesContent = configPaths.map(config => fs.readFileSync(config, 'utf-8'));

    filesContent.forEach(content => diConfigRepository.push(content));
};
