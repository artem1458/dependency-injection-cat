import { getContextPaths } from './context/getContextPaths';
import { ProgramRepository } from './program/ProgramRepository';
import { registerContexts } from './context/registerContexts';
import { registerBeans } from './bean/registerBeans';
import { CompilationContext } from '../compilation-context/CompilationContext';
import { registerBeanDependencies } from './bean-dependencies/registerBeanDependencies';
import { buildDependencyGraph } from './connect-dependencies/buildDependencyGraph';
import { reportAboutCyclicDependencies } from './report-cyclic-dependencies/reportAboutCyclicDependencies';

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
    registerBeanDependencies();
    buildDependencyGraph();
    reportAboutCyclicDependencies();

    CompilationContext.throw();
};
