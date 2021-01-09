import { getContextPaths } from './context/getContextPaths';
import { ProgramRepository } from './program/ProgramRepository';
import { registerContexts } from './context/registerContexts';
import { ContextRepository } from './context/ContextRepository';

let wasInitiated = false;

export const runCompile = () => {
    if (wasInitiated) {
        return;
    }
    wasInitiated = true;

    const contextPaths = getContextPaths();

    ProgramRepository.initProgram(contextPaths);
    registerContexts(contextPaths);
    ContextRepository.repository.forEach((value, key) => {
        key;
    });
};
