import { getContextPaths } from './context/getContextPaths';
import { ProgramRepository } from './program/ProgramRepository';
import { registerContexts } from './context/registerContexts';
import { registerBeans } from './bean/registerBeans';
import { CompilationContext } from '../compilation-context/CompilationContext';
import { registerBeanDependencies } from './bean-dependencies/registerBeanDependencies';
import { buildDependencyGraphAndFillQualifiedBeans } from './connect-dependencies/buildDependencyGraphAndFillQualifiedBeans';
import { reportAboutCyclicDependencies } from './report-cyclic-dependencies/reportAboutCyclicDependencies';
import { TsConfigProvider } from './ts-config-path-provider/TsConfigProvider';
import { PathResolver } from './ts-helpers/path-resolver/PathResolver';
import { buildContexts } from './build-context/buildContexts';
import { checkIsAllBeansRegisteredInContext } from './bean/checkIsAllBeansRegisteredInContext';

let wasInitiated = false;

export const runCompile = () => {
    if (wasInitiated) {
        return;
    }
    wasInitiated = true;

    TsConfigProvider.init();
    PathResolver.init();

    const contextPaths = getContextPaths();
    ProgramRepository.initProgram(contextPaths);

    registerContexts(contextPaths);
    registerBeans();
    checkIsAllBeansRegisteredInContext();
    registerBeanDependencies();
    buildDependencyGraphAndFillQualifiedBeans();
    reportAboutCyclicDependencies();

    CompilationContext.throw();
    buildContexts();
};
