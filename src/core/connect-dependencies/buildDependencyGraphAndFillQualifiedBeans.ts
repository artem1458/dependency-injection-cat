import { BeanRepository } from '../bean/BeanRepository';
import { BeanDependenciesRepository } from '../bean-dependencies/BeanDependenciesRepository';
import { DependencyGraph } from './DependencyGraph';
import { GLOBAL_CONTEXT_NAME } from '../context/constants';
import { IContextDescriptor } from '../context/ContextRepository';
import { QualifiedTypeKind } from '../ts-helpers/type-qualifier/QualifiedType';
import { uniqNotEmpty } from '../utils/uniqNotEmpty';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { DependencyResolvingError } from '../../compilation-context/messages/errors/DependencyResolvingError';
import { getFormattedParameterNameAndType } from '../utils/getFormattedParameterNameAndType';

export const buildDependencyGraphAndFillQualifiedBeans = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor
) => {
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
                        compilationContext.report(new DependencyResolvingError(
                            `Can not find Bean candidates for ${dependencyDescriptor.parameterName}.`,
                            beanDescriptor.node,
                            contextDescriptor.node,
                        ));
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
                        (BeanRepository.beanDescriptorRepository.get(GLOBAL_CONTEXT_NAME)?.get(dependencyDescriptor.qualifiedType.fullTypeId) ?? [])
                            .filter(it => it !== beanDescriptor);

                    //<editor-fold desc="Trying to find in current context (not-embedded Beans)">
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
                        compilationContext.report(new DependencyResolvingError(
                            `Can not find Bean candidate for parameter "${getFormattedParameterNameAndType(dependencyDescriptor.parameterName, dependencyDescriptor.qualifiedType)}".`,
                            beanDescriptor.node,
                            contextDescriptor.node,
                        ));
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
                            compilationContext.report(new DependencyResolvingError(
                                `Can not find Bean candidate for parameter "${getFormattedParameterNameAndType(dependencyDescriptor.parameterName, dependencyDescriptor.qualifiedType)}", found ${beanCandidatesFromCurrentContextQualifiedByParameterName.length} candidates with same name.`,
                                beanDescriptor.node,
                                contextDescriptor.node,
                            ));
                            return;
                        }

                        compilationContext.report(new DependencyResolvingError(
                            `Can not find Bean candidate for parameter "${getFormattedParameterNameAndType(dependencyDescriptor.parameterName, dependencyDescriptor.qualifiedType)}", found ${beanCandidatesFromCurrentContextQualifiedByParameterName.length} candidates. Please use @Qualifier or rename parameter to match Bean name, to specify which Bean should be injected.`,
                            beanDescriptor.node,
                            contextDescriptor.node,
                        ));
                        return;
                    }
                    //</editor-fold>

                    //<editor-fold desc="Trying to find in current context (embedded Beans)">
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
                            compilationContext.report(new DependencyResolvingError(
                                `Can not find EmbeddedBean candidate for parameter "${getFormattedParameterNameAndType(dependencyDescriptor.parameterName, dependencyDescriptor.qualifiedType)}", found ${beansByParameterName.length} candidates with same name.`,
                                beanDescriptor.node,
                                contextDescriptor.node,
                            ));
                            return;
                        }

                        compilationContext.report(new DependencyResolvingError(
                            `Can not find EmbeddedBean candidate for parameter "${getFormattedParameterNameAndType(dependencyDescriptor.parameterName, dependencyDescriptor.qualifiedType)}", found ${embeddedBeanCandidatesFromCurrentContext.length} candidates. Please use @Qualifier or rename parameter to match Bean name, to specify which Bean should be injected.`,
                            beanDescriptor.node,
                            contextDescriptor.node,
                        ));
                        return;
                    }
                    //</editor-fold>

                    //<editor-fold desc="Trying to find in global context">
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
                            compilationContext.report(new DependencyResolvingError(
                                `Can not find Bean candidate for parameter "${getFormattedParameterNameAndType(dependencyDescriptor.parameterName, dependencyDescriptor.qualifiedType)}", found ${beanCandidatesFromGlobalContextQualifiedByParameterName.length} candidates in Global context with same name.`,
                                beanDescriptor.node,
                                contextDescriptor.node,
                            ));
                            return;
                        }

                        compilationContext.report(new DependencyResolvingError(
                            `Can not find Bean candidate for parameter "${getFormattedParameterNameAndType(dependencyDescriptor.parameterName, dependencyDescriptor.qualifiedType)}", found ${beanCandidatesFromGlobalContext.length} candidates in Global context. Please use @Qualifier or rename parameter to match Bean name, to specify which Bean should be injected.`,
                            beanDescriptor.node,
                            contextDescriptor.node,
                        ));
                        return;
                    }
                    //</editor-fold>
                }
            });
        });
    });
};

