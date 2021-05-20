import { getContextPaths } from './context/getContextPaths';
import { ProgramRepository } from './program/ProgramRepository';
import { registerGlobalCatContexts } from './context/registerGlobalCatContexts';
import { registerGlobalBeans } from './bean/registerGlobalBeans';
import { registerBeanDependencies } from './bean-dependencies/registerBeanDependencies';
import { buildDependencyGraphAndFillQualifiedBeans } from './connect-dependencies/buildDependencyGraphAndFillQualifiedBeans';
import { reportAboutCyclicDependencies } from './report-cyclic-dependencies/reportAboutCyclicDependencies';
import { TsConfigProvider } from './ts-config-path-provider/TsConfigProvider';
import { PathResolver } from './ts-helpers/path-resolver/PathResolver';
import { buildContexts } from './build-context/buildContexts';

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

    //BY NOW ignoring global context, will deal with them later
    // registerGlobalCatContexts(contextPaths);
    // registerGlobalBeans();
    // checkIsAllBeansRegisteredInContext();
    // registerBeanDependencies();
    // buildDependencyGraphAndFillQualifiedBeans();
    // reportAboutCyclicDependencies();

    // buildContexts();
};
