import { TsConfigProvider } from './ts-config-path-provider/TsConfigProvider';
import { PathResolver } from './ts-helpers/path-resolver/PathResolver';
import { ContextPathsRepository } from './context/ContextPathsRepository';
import { getContextPaths } from './context/getContextPaths';
import { ProgramRepository } from './program/ProgramRepository';

let wasInitiated = false;

export const initContexts = () => {
    if (wasInitiated) {
        return;
    }
    wasInitiated = true;

    TsConfigProvider.init();
    PathResolver.init();
    ContextPathsRepository.paths = getContextPaths();
    ProgramRepository.initProgram(ContextPathsRepository.paths);
};
