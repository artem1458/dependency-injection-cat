import { getContextPaths } from './context/getContextPaths';
import { ProgramRepository } from './program/ProgramRepository';
import { TsConfigProvider } from './ts-config-path-provider/TsConfigProvider';
import { PathResolver } from './ts-helpers/path-resolver/PathResolver';

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
