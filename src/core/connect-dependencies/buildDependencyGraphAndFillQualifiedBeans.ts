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

    beansMap.forEach((beanDescriptors, beanType) => {
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

                    if (mergedBeans.length === 0) {
                        CompilationContext.reportError({
                            node: dependencyDescriptor.node,
                            message: 'Not found any Bean candidates for list',
                            filePath: beanDescriptor.contextDescriptor.absolutePath,
                            relatedContextPath: beanDescriptor.contextDescriptor.absolutePath,
                        });
                        return;
                    }

                    mergedBeans.forEach(bean => {
                        dependencyDescriptor.qualifiedBeans.add(bean);
                    });
                    DependencyGraph.addNodeWithEdges(beanDescriptor, mergedBeans);

                    return;
                }

                if (dependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.PLAIN) {
                    const nonUniqBeanDescriptorsFromCurrentContext =
                        (beansMap.get(dependencyDescriptor.qualifiedType.fullTypeId) ?? [])
                            .filter(it => it !== beanDescriptor);
                    const nonUniqBeanDescriptorsFromGlobalContext =
                        (BeanRepository.beanDescriptorRepository.get(GLOBAL_CONTEXT_NAME)?.
                            get(dependencyDescriptor.qualifiedType.fullTypeId) ?? [])
                            .filter(it => it !== beanDescriptor);

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
                        dependencyDescriptor.qualifiedBeans.add(beanCandidatesFromCurrentContext[0]);
                        DependencyGraph.addNodeWithEdges(beanDescriptor, beanCandidatesFromCurrentContext);
                        return;
                    }

                    if (beanCandidatesFromCurrentContext.length > 1) {
                        const beanCandidatesFromCurrentContextQualifiedByParameterName = beanCandidatesFromCurrentContext
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
                                ...beanCandidatesFromCurrentContext.map(it => it.node),
                            ],
                            message: `Found ${beanCandidatesFromCurrentContext.length} Bean candidates, please use @Qualifier or rename parameter to match bean name, to specify which Bean should be injected`,
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

