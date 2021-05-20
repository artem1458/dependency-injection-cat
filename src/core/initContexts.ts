import { TsConfigProvider } from './ts-config-path-provider/TsConfigProvider';
import { PathResolver } from './ts-helpers/path-resolver/PathResolver';
import { ProgramRepository } from './program/ProgramRepository';

let wasInitiated = false;

export const initContexts = () => {
    if (wasInitiated) {
        return;
    }
    wasInitiated = true;

    TsConfigProvider.init();
    PathResolver.init();
    ProgramRepository.initProgram([]);
};
