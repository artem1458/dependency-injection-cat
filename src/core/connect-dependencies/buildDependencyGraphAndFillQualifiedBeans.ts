import { BeanRepository } from '../bean/BeanRepository';
import { BeanDependenciesRepository } from '../bean-dependencies/BeanDependenciesRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { DependencyGraph } from './DependencyGraph';
import { GLOBAL_CONTEXT_NAME } from '../context/constants';
import { IContextDescriptor } from '../context/ContextRepository';
import { QualifiedTypeKind } from '../ts-helpers/type-qualifier/QualifiedType';
import { uniqNotEmpty } from '../utils/uniqNotEmpty';

export const buildDependencyGraphAndFillQualifiedBeans = (contextDescriptor: IContextDescriptor) => {
    const beansMap = BeanRepository.beanDescriptorRepository.get(contextDescriptor.name);
    const beanDependenciesMap = BeanDependenciesRepository.getBeanDescriptorMapByContextName(contextDescriptor.name);

    if (!beansMap || !beanDependenciesMap) {
        return;
    }

    beansMap.forEach((beanDescriptors) => {
        beanDescriptors.forEach(beanDescriptor => {
            const dependencies = beanDependenciesMap.get(beanDescriptor) ?? [];

            dependencies.forEach(dependencyDescriptor => {
                if (dependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.LIST) {
                    const beansFromCurrentContext = beansMap.get(dependencyDescriptor.qualifiedType.fullTypeId) ?? [];
                    const beansFromGlobalContext = BeanRepository.beanDescriptorRepository.get(GLOBAL_CONTEXT_NAME)
                        ?.get(dependencyDescriptor.qualifiedType.fullTypeId) ?? [];

                    const mergedBeans = [
                        ...beansFromCurrentContext,
                        ...beansFromGlobalContext,
                    ].filter(it => it !== beanDescriptor);

                    const uniqMergedBeans = uniqNotEmpty(mergedBeans);

                    if (uniqMergedBeans.length === 0) {
                        CompilationContext.reportError({
                            node: dependencyDescriptor.node,
                            message: 'Not found any Bean candidates for list',
                            filePath: beanDescriptor.contextDescriptor.absolutePath,
                            relatedContextPath: beanDescriptor.contextDescriptor.absolutePath,
                        });
                        return;
                    }

                    uniqMergedBeans.forEach(bean => {
                        dependencyDescriptor.qualifiedBeans.add(bean);
                    });
                    DependencyGraph.addNodeWithEdges(beanDescriptor, uniqMergedBeans);

                    return;
                }

                if (dependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.PLAIN) {
                    const currentContextBeans = beansMap.get(dependencyDescriptor.qualifiedType.fullTypeId) ?? [];

                    const currentContextNonEmbeddedBeans = currentContextBeans
                        .filter(it => it !== beanDescriptor && it.beanKind !== 'embedded');
                    const currentContextEmbeddedBeans = currentContextBeans
                        .filter(it => it !== beanDescriptor && it.beanKind === 'embedded');
                    const globalContextBeans =
                        (BeanRepository.beanDescriptorRepository.get(GLOBAL_CONTEXT_NAME)?.
                            get(dependencyDescriptor.qualifiedType.fullTypeId) ?? [])
                            .filter(it => it !== beanDescriptor);

                    let nonEmbeddedBeanCandidatesFromCurrentContext = uniqNotEmpty(currentContextNonEmbeddedBeans);
                    let embeddedBeanCandidatesFromCurrentContext = uniqNotEmpty(currentContextEmbeddedBeans);
                    let beanCandidatesFromGlobalContext = uniqNotEmpty(globalContextBeans);

                    if (dependencyDescriptor.qualifier !== null) {
                        nonEmbeddedBeanCandidatesFromCurrentContext = nonEmbeddedBeanCandidatesFromCurrentContext
                            .filter(it => it.classMemberName === dependencyDescriptor.qualifier);
                        embeddedBeanCandidatesFromCurrentContext = embeddedBeanCandidatesFromCurrentContext
                            .filter(it => it.nestedProperty === dependencyDescriptor.qualifier);
                        beanCandidatesFromGlobalContext = beanCandidatesFromGlobalContext
                            .filter(it => it.classMemberName === dependencyDescriptor.qualifier);
                    }

                    if (
                        nonEmbeddedBeanCandidatesFromCurrentContext.length === 0
                        && embeddedBeanCandidatesFromCurrentContext.length === 0
                        && beanCandidatesFromGlobalContext.length === 0
                    ) {
                        CompilationContext.reportError({
                            node: dependencyDescriptor.node,
                            message: 'Bean for dependency is not registered',
                            filePath: beanDescriptor.contextDescriptor.absolutePath,
                            relatedContextPath: beanDescriptor.contextDescriptor.absolutePath,
                        });
                        return;
                    }

                    if (nonEmbeddedBeanCandidatesFromCurrentContext.length === 1) {
                        dependencyDescriptor.qualifiedBeans.add(nonEmbeddedBeanCandidatesFromCurrentContext[0]);
                        DependencyGraph.addNodeWithEdges(beanDescriptor, nonEmbeddedBeanCandidatesFromCurrentContext);
                        return;
                    }

                    if (nonEmbeddedBeanCandidatesFromCurrentContext.length > 1) {
                        const beanCandidatesFromCurrentContextQualifiedByParameterName = nonEmbeddedBeanCandidatesFromCurrentContext
                            .filter(it => it.classMemberName === dependencyDescriptor.parameterName);

                        if (beanCandidatesFromCurrentContextQualifiedByParameterName.length === 1) {
                            dependencyDescriptor.qualifiedBeans.add(beanCandidatesFromCurrentContextQualifiedByParameterName[0]);
                            DependencyGraph.addNodeWithEdges(beanDescriptor, beanCandidatesFromCurrentContextQualifiedByParameterName);
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
                                ...nonEmbeddedBeanCandidatesFromCurrentContext.map(it => it.node),
                            ],
                            message: `Found ${nonEmbeddedBeanCandidatesFromCurrentContext.length} Bean candidates, please use @Qualifier or rename parameter to match bean name, to specify which Bean should be injected`,
                            filePath: beanDescriptor.contextDescriptor.absolutePath,
                            relatedContextPath: beanDescriptor.contextDescriptor.absolutePath,
                        });
                        return;
                    }

                    if (embeddedBeanCandidatesFromCurrentContext.length === 1) {
                        dependencyDescriptor.qualifiedBeans.add(embeddedBeanCandidatesFromCurrentContext[0]);
                        DependencyGraph.addNodeWithEdges(beanDescriptor, embeddedBeanCandidatesFromCurrentContext);
                        return;
                    }

                    if (embeddedBeanCandidatesFromCurrentContext.length > 1) {
                        const beansByParameterName = embeddedBeanCandidatesFromCurrentContext
                            .filter(it => it.nestedProperty === dependencyDescriptor.parameterName);

                        if (beansByParameterName.length === 1) {
                            dependencyDescriptor.qualifiedBeans.add(beansByParameterName[0]);
                            DependencyGraph.addNodeWithEdges(beanDescriptor, beansByParameterName);
                            return;
                        }

                        if (beansByParameterName.length > 1) {
                            CompilationContext.reportErrorWithMultipleNodes({
                                nodes: [
                                    dependencyDescriptor.node,
                                    ...beansByParameterName.map(it => it.node),
                                ],
                                message: `Found ${beansByParameterName.length} Embedded Bean candidates, with same name, please rename one of beans`,
                                filePath: beanDescriptor.contextDescriptor.absolutePath,
                                relatedContextPath: beanDescriptor.contextDescriptor.absolutePath,
                            });
                            return;
                        }

                        CompilationContext.reportErrorWithMultipleNodes({
                            nodes: [
                                dependencyDescriptor.node,
                                ...embeddedBeanCandidatesFromCurrentContext.map(it => it.node),
                            ],
                            message: `Found ${embeddedBeanCandidatesFromCurrentContext.length} Embedded Bean candidates, please use @Qualifier or rename parameter to match bean name, to specify which Bean should be injected`,
                            filePath: beanDescriptor.contextDescriptor.absolutePath,
                            relatedContextPath: beanDescriptor.contextDescriptor.absolutePath,
                        });
                        return;
                    }

                    if (beanCandidatesFromGlobalContext.length === 1) {
                        dependencyDescriptor.qualifiedBeans.add(beanCandidatesFromGlobalContext[0]);
                        DependencyGraph.addNodeWithEdges(beanDescriptor, beanCandidatesFromGlobalContext);
                        return;
                    }

                    if (beanCandidatesFromGlobalContext.length > 1) {
                        const beanCandidatesFromGlobalContextQualifiedByParameterName = beanCandidatesFromGlobalContext
                            .filter(it => it.classMemberName === dependencyDescriptor.parameterName);

                        if (beanCandidatesFromGlobalContextQualifiedByParameterName.length === 1) {
                            dependencyDescriptor.qualifiedBeans.add(beanCandidatesFromGlobalContextQualifiedByParameterName[0]);
                            DependencyGraph.addNodeWithEdges(beanDescriptor, beanCandidatesFromGlobalContextQualifiedByParameterName);
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
                }
            });
        });
    });
};

