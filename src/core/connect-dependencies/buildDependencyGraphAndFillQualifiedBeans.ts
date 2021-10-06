import { BeanRepository } from '../bean/BeanRepository';
import { BeanDependenciesRepository } from '../bean-dependencies/BeanDependenciesRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { DependencyGraph } from './DependencyGraph';
import { GLOBAL_CONTEXT_NAME } from '../context/constants';
import { IContextDescriptor } from '../context/ContextRepository';

export const buildDependencyGraphAndFillQualifiedBeans = (contextDescriptor: IContextDescriptor) => {
    const beansMap = BeanRepository.beanDescriptorRepository.get(contextDescriptor.name);
    const beanDependenciesMap = BeanDependenciesRepository.getBeanDescriptorMapByContextName(contextDescriptor.name);

    if (!beansMap || !beanDependenciesMap) {
        return;
    }

    beansMap.forEach((beanDescriptors, beanType) => {
        beanDescriptors.forEach(beanDescriptor => {
            const dependencies = beanDependenciesMap.get(beanDescriptor) ?? null;

            if (dependencies === null) {
                return;
            }

            dependencies.forEach(dependencyDescriptor => {
                const nonUniqBeanDescriptorsFromCurrentContext = dependencyDescriptor.qualifiedType.
                    typeIds.list().map(it => beansMap.get(it))
                    .flat();
                const nonUniqBeanDescriptorsFromGlobalContext =dependencyDescriptor.qualifiedType.
                    typeIds.list().map(it => BeanRepository.beanDescriptorRepository.get(GLOBAL_CONTEXT_NAME)?.get(it))
                    .flat();

                let beanCandidatesFromCurrentContext = uniqNotEmpty(nonUniqBeanDescriptorsFromCurrentContext);
                let beanCandidatesFromGlobalContext = uniqNotEmpty(nonUniqBeanDescriptorsFromGlobalContext);

                if (dependencyDescriptor.qualifier !== null) {
                    beanCandidatesFromCurrentContext = beanCandidatesFromCurrentContext
                        .filter(it => it.classMemberName === dependencyDescriptor.qualifier);
                    beanCandidatesFromGlobalContext = beanCandidatesFromGlobalContext
                        .filter(it => it.classMemberName === dependencyDescriptor.qualifier);
                }

                if (beanCandidatesFromCurrentContext.length === 0 && beanCandidatesFromGlobalContext.length === 0) {
                    CompilationContext.reportError({
                        node: dependencyDescriptor.node,
                        message: 'Bean for dependency is not registered',
                        filePath: beanDescriptor.contextDescriptor.absolutePath,
                        relatedContextPath: beanDescriptor.contextDescriptor.absolutePath,
                    });
                    return;
                }

                if (beanCandidatesFromCurrentContext.length === 1) {
                    dependencyDescriptor.qualifiedBean = beanCandidatesFromCurrentContext[0];
                    DependencyGraph.addNodeWithEdges(beanDescriptor, beanCandidatesFromCurrentContext[0]);
                    return;
                }

                if (beanCandidatesFromCurrentContext.length > 1) {
                    const beanCandidatesFromCurrentContextQualifiedByParameterName = beanCandidatesFromCurrentContext
                        .filter(it => it.classMemberName === dependencyDescriptor.parameterName);

                    if (beanCandidatesFromCurrentContextQualifiedByParameterName.length === 1) {
                        dependencyDescriptor.qualifiedBean = beanCandidatesFromCurrentContextQualifiedByParameterName[0];
                        DependencyGraph.addNodeWithEdges(beanDescriptor, beanCandidatesFromCurrentContextQualifiedByParameterName[0]);
                        return;
                    }

                    if (beanCandidatesFromCurrentContextQualifiedByParameterName.length > 1) {
                        CompilationContext.reportErrorWithMultipleNodes({
                            nodes: [
                                dependencyDescriptor.node,
                                ...beanCandidatesFromCurrentContextQualifiedByParameterName.map(it => it.node),
                            ],
                            message: `Found ${beanCandidatesFromCurrentContextQualifiedByParameterName.length} Bean candidates, with same name, please rename one of beans`,
                            filePath: beanDescriptor.contextDescriptor.absolutePath,
                            relatedContextPath: beanDescriptor.contextDescriptor.absolutePath,
                        });
                        return;
                    }

                    CompilationContext.reportErrorWithMultipleNodes({
                        nodes: [
                            dependencyDescriptor.node,
                            ...beanCandidatesFromCurrentContext.map(it => it.node),
                        ],
                        message: `Found ${beanCandidatesFromCurrentContext.length} Bean candidates, please use @Qualifier or rename parameter to match bean name, to specify which Bean should be injected`,
                        filePath: beanDescriptor.contextDescriptor.absolutePath,
                        relatedContextPath: beanDescriptor.contextDescriptor.absolutePath,
                    });
                    return;
                }

                if (beanCandidatesFromGlobalContext.length === 1) {
                    dependencyDescriptor.qualifiedBean = beanCandidatesFromGlobalContext[0];
                    DependencyGraph.addNodeWithEdges(beanDescriptor, beanCandidatesFromGlobalContext[0]);
                    return;
                }

                if (beanCandidatesFromGlobalContext.length > 1) {
                    const beanCandidatesFromGlobalContextQualifiedByParameterName = beanCandidatesFromGlobalContext
                        .filter(it => it.classMemberName === dependencyDescriptor.parameterName);

                    if (beanCandidatesFromGlobalContextQualifiedByParameterName.length === 1) {
                        dependencyDescriptor.qualifiedBean = beanCandidatesFromGlobalContextQualifiedByParameterName[0];
                        DependencyGraph.addNodeWithEdges(beanDescriptor, beanCandidatesFromGlobalContextQualifiedByParameterName[0]);
                        return;
                    }

                    if (beanCandidatesFromGlobalContextQualifiedByParameterName.length > 1) {
                        CompilationContext.reportErrorWithMultipleNodes({
                            nodes: [
                                dependencyDescriptor.node,
                                ...beanCandidatesFromGlobalContextQualifiedByParameterName.map(it => it.node),
                            ],
                            message: `Found ${beanCandidatesFromGlobalContextQualifiedByParameterName.length} Bean candidates in Global context, with same name, please rename one of beans`,
                            filePath: beanDescriptor.contextDescriptor.absolutePath,
                            relatedContextPath: beanDescriptor.contextDescriptor.absolutePath,
                        });
                        return;
                    }

                    CompilationContext.reportErrorWithMultipleNodes({
                        nodes: [
                            dependencyDescriptor.node,
                            ...beanCandidatesFromGlobalContext.map(it => it.node),
                        ],
                        message: `Found ${beanCandidatesFromGlobalContext.length} Bean candidates in Global context, please use @Qualifier or rename parameter to match bean name, to specify which Bean should be injected`,
                        filePath: beanDescriptor.contextDescriptor.absolutePath,
                        relatedContextPath: beanDescriptor.contextDescriptor.absolutePath,
                    });
                    return;
                }
            });
        });
    });
};

function uniqNotEmpty<T>(list: (T | undefined | null)[]): T[] {
    return Array.from(new Set(list)).filter((it): it is T => Boolean(it));
}
