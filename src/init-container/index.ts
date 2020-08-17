import glob from 'glob';
import { DiConfigRepository } from '../di-config-repository';
import { transformerConfig } from '../transformer-config';
import { ConfigIdRepository } from '../factories/ConfigIdRepository';
import { runCompile } from '../run-compile/runCompile';
import { getDiConfigPattern } from '../transformer-config/getDiConfigPattern';

let wasInitiated = false;

export function initContainer(): void {
    if (wasInitiated) {
        return;
    }
    wasInitiated = true;

    const configPaths = glob.sync(getDiConfigPattern(), { absolute: true, ignore: transformerConfig.ignorePatterns });
    configPaths.forEach(path => {
        ConfigIdRepository.registerConfig(path);
        DiConfigRepository.registerConfig(path);
    });
    runCompile();
}
