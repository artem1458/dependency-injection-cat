import glob from 'glob';
import { transformerConfig } from '../transformer-config';
import { DiConfigRepository } from './repository';
import { FactoryIdRepository } from '../factories/FactoryIdRepository';
import { ShouldReinitializeRepository } from '../transformer/ShouldReinitializeRepository';

export const initDiConfigRepository = (): void => {
    const { diConfigPattern, ignorePatterns } = transformerConfig;

    if (!ShouldReinitializeRepository.value) {
        return;
    }

    if (!diConfigPattern) {
        throw new Error('DI Config pattern is empty, please check plugin configuration');
    }

    const configPaths = glob.sync(diConfigPattern, { absolute: true, ignore: ignorePatterns });

    configPaths.forEach(path => {
        FactoryIdRepository.registerFactory(path);
        DiConfigRepository.registerConfig(path);
    });
};
