import glob from 'glob';
import { transformerConfig } from '../transformer-config';
import { DiConfigRepository } from './repository';
import { ConfigIdRepository } from '../factories/ConfigIdRepository';
import { getDiConfigPattern } from '../transformer-config/getDiConfigPattern';

export const initDiConfigRepository = (): void => {
    const { ignorePatterns } = transformerConfig;

    const configPaths = glob.sync(getDiConfigPattern(), { absolute: true, ignore: ignorePatterns });

    configPaths.forEach(path => {
        ConfigIdRepository.registerConfig(path);
        DiConfigRepository.registerConfig(path);
    });
};
