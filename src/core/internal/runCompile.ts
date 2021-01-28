import { getContextPaths } from './context/getContextPaths';
import { ProgramRepository } from './program/ProgramRepository';
import { registerContexts } from './context/registerContexts';
import { registerBeans } from './beans/registerBeans';
import { CompilationContext } from '../compilation-context/CompilationContext';

let wasInitiated = false;

export const runCompile = () => {
    if (wasInitiated) {
        return;
    }
    wasInitiated = true;

    const contextPaths = getContextPaths();

    ProgramRepository.initProgram(contextPaths);
    registerContexts(contextPaths);
    registerBeans();


    CompilationContext.throw();
};
