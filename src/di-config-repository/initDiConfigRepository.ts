import glob from 'glob';
import { transformerConfig } from '../transformer-config';
import { diConfigRepository } from './repository';
import { FactoryIdRepository } from '../factories/FactoryIdRepository';

let initialized: boolean = false;

export const initDiConfigRepository = (): void => {
    const { diConfigPattern, ignorePatterns } = transformerConfig;

    if (initialized) {
        return;
    }

    if (!diConfigPattern) {
        throw new Error('DI Config pattern is empty, please check plugin configuration');
    }

    initialized = true;

    const configPaths = glob.sync(diConfigPattern, { absolute: true, ignore: ignorePatterns });

    configPaths.forEach(path => {
        FactoryIdRepository.registerFactory(path);
        diConfigRepository.push(path);
    });
};
