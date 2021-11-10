import ts from 'typescript';
import { IContextDescriptor } from '../context/ContextRepository';
import {
    ILifecycleDependencyDescriptor,
    LifecycleMethodsRepository,
    TLifecycleNodeKind
} from './LifecycleMethodsRepository';
import { getQualifierValueFromFunctionArgument } from '../bean-dependencies/getQualifierValueFromFunctionArgument';
import { getParameterType } from '../bean-dependencies/getParameterType';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { BeanRepository } from '../bean/BeanRepository';
import { GLOBAL_CONTEXT_NAME } from '../context/constants';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import { TLifecycle } from '../../external/InternalCatContext';
import { QualifiedTypeKind } from '../ts-helpers/type-qualifier/QualifiedType';
import { ExtendedSet } from '../utils/ExtendedSet';
import { uniqNotEmpty } from '../utils/uniqNotEmpty';
import { restrictedClassMemberNames } from '../bean/constants';

export const registerLifecycleExpression = (
    contextDescriptor: IContextDescriptor,
    classMemberName: string,
    node: ClassPropertyArrowFunction | ts.MethodDeclaration,
    lifecycles: Set<TLifecycle>,
    lifecycleNodeKind: TLifecycleNodeKind,
) => {
    if (restrictedClassMemberNames.has(classMemberName)) {
        CompilationContext.reportError({
            node: node,
            message: `"${classMemberName}" name is reserved for the di-container, please use another name instead`,
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    const beansMap = BeanRepository.beanDescriptorRepository.get(contextDescriptor.name);

    if (!beansMap) {
        return;
    }

    const dependencies = new ExtendedSet<ILifecycleDependencyDescriptor>();

    const parameters = ts.isMethodDeclaration(node) ? node.parameters : node.initializer.parameters;

    parameters.forEach(parameter => {
        const parameterName = parameter.name.getText();
        const qualifier = getQualifierValueFromFunctionArgument(parameter, contextDescriptor);
        const qualifiedType = getParameterType(parameter);

        if (qualifiedType === null) {
            CompilationContext.reportError({
                node: parameter,
                message: 'Can\'t qualify type of Context Lifecycle parameter',
                filePath: contextDescriptor.absolutePath,
                relatedContextPath: contextDescriptor.absolutePath,
            });
            return;
        }

        if (qualifiedType.kind === QualifiedTypeKind.LIST) {
            const beansFromCurrentContext = beansMap.get(qualifiedType.fullTypeId) ?? [];
            const beansFromGlobalContext = BeanRepository.beanDescriptorRepository.get(GLOBAL_CONTEXT_NAME)
                ?.get(qualifiedType.fullTypeId) ?? [];

            const mergedBeans = [
                ...beansFromCurrentContext,
                ...beansFromGlobalContext,
            ];

            const uniqMergedBeans = uniqNotEmpty(mergedBeans);

            if (uniqMergedBeans.length === 0) {
                CompilationContext.reportError({
                    node: parameter,
                    message: 'Not found any Bean candidates for list',
                    filePath: contextDescriptor.absolutePath,
                    relatedContextPath: contextDescriptor.absolutePath,
                });
                return;
            }

            dependencies.add({
                qualifiedType,
                parameterName,
                beanDescriptors: new ExtendedSet(uniqMergedBeans)
            });
            return;
        }

        if (qualifiedType.kind === QualifiedTypeKind.PLAIN) {
            const currentContextBeans = beansMap.get(qualifiedType.fullTypeId) ?? [];
            const currentContextNonEmbeddedBeans = currentContextBeans.filter(it => it.beanKind !== 'embedded');
            const currentContextEmbeddedBeans = currentContextBeans.filter(it => it.beanKind === 'embedded');
            const nonUniqBeanDescriptorsFromGlobalContext = BeanRepository
                .beanDescriptorRepository.get(GLOBAL_CONTEXT_NAME)?.get(qualifiedType.fullTypeId) ?? [];

            let nonEmbeddedBeanCandidatesFromCurrentContext = uniqNotEmpty(currentContextNonEmbeddedBeans);
            let embeddedBeanCandidatesFromCurrentContext = uniqNotEmpty(currentContextEmbeddedBeans);
            let beanCandidatesFromGlobalContext = uniqNotEmpty(nonUniqBeanDescriptorsFromGlobalContext);

            if (qualifier !== null) {
                nonEmbeddedBeanCandidatesFromCurrentContext = nonEmbeddedBeanCandidatesFromCurrentContext
                    .filter(it => it.classMemberName === qualifier);
                embeddedBeanCandidatesFromCurrentContext = embeddedBeanCandidatesFromCurrentContext
                    .filter(it => it.nestedProperty === qualifier);
                beanCandidatesFromGlobalContext = beanCandidatesFromGlobalContext
                    .filter(it => it.classMemberName === qualifier);
            }

            if (
                nonEmbeddedBeanCandidatesFromCurrentContext.length === 0
                && embeddedBeanCandidatesFromCurrentContext.length === 0
                && beanCandidatesFromGlobalContext.length === 0
            ) {
                CompilationContext.reportError({
                    node: parameter,
                    message: 'Bean for dependency is not registered',
                    filePath: contextDescriptor.absolutePath,
                    relatedContextPath: contextDescriptor.absolutePath,
                });
                return;
            }

            if (nonEmbeddedBeanCandidatesFromCurrentContext.length === 1) {
                dependencies.add({
                    parameterName,
                    qualifiedType,
                    beanDescriptors: new ExtendedSet(nonEmbeddedBeanCandidatesFromCurrentContext),
                });
                return;
            }

            if (nonEmbeddedBeanCandidatesFromCurrentContext.length > 1) {
                const beanCandidatesFromCurrentContextQualifiedByParameterName = nonEmbeddedBeanCandidatesFromCurrentContext
                    .filter(it => it.classMemberName === parameterName);

                if (beanCandidatesFromCurrentContextQualifiedByParameterName.length === 1) {
                    dependencies.add({
                        parameterName,
                        qualifiedType,
                        beanDescriptors: new ExtendedSet(beanCandidatesFromCurrentContextQualifiedByParameterName)
                    });
                    return;
                }

                if (beanCandidatesFromCurrentContextQualifiedByParameterName.length > 1) {
                    CompilationContext.reportErrorWithMultipleNodes({
                        nodes: [
                            parameter,
                            ...beanCandidatesFromCurrentContextQualifiedByParameterName.map(it => it.node),
                        ],
                        message: `Found ${beanCandidatesFromCurrentContextQualifiedByParameterName.length} Bean candidates, with same name, please rename one of beans`,
                        filePath: contextDescriptor.absolutePath,
                        relatedContextPath: contextDescriptor.absolutePath,
                    });
                    return;
                }

                CompilationContext.reportErrorWithMultipleNodes({
                    nodes: [
                        parameter,
                        ...nonEmbeddedBeanCandidatesFromCurrentContext.map(it => it.node),
                    ],
                    message: `Found ${nonEmbeddedBeanCandidatesFromCurrentContext.length} Bean candidates, please use @Qualifier or rename parameter to match bean name, to specify which Bean should be injected`,
                    filePath: contextDescriptor.absolutePath,
                    relatedContextPath: contextDescriptor.absolutePath,
                });
                return;
            }

            if (embeddedBeanCandidatesFromCurrentContext.length === 1) {
                dependencies.add({
                    parameterName,
                    qualifiedType,
                    beanDescriptors: new ExtendedSet(embeddedBeanCandidatesFromCurrentContext),
                });
                return;
            }

            if (embeddedBeanCandidatesFromCurrentContext.length > 1) {
                const beansByParameterName = embeddedBeanCandidatesFromCurrentContext
                    .filter(it => it.nestedProperty === parameterName);

                if (beansByParameterName.length === 1) {
                    dependencies.add({
                        parameterName,
                        qualifiedType,
                        beanDescriptors: new ExtendedSet(beansByParameterName)
                    });
                    return;
                }

                if (beansByParameterName.length > 1) {
                    CompilationContext.reportErrorWithMultipleNodes({
                        nodes: [
                            parameter,
                            ...beansByParameterName.map(it => it.node),
                        ],
                        message: `Found ${beansByParameterName.length} Bean candidates, with same name, please rename one of beans`,
                        filePath: contextDescriptor.absolutePath,
                        relatedContextPath: contextDescriptor.absolutePath,
                    });
                    return;
                }

                CompilationContext.reportErrorWithMultipleNodes({
                    nodes: [
                        parameter,
                        ...embeddedBeanCandidatesFromCurrentContext.map(it => it.node),
                    ],
                    message: `Found ${embeddedBeanCandidatesFromCurrentContext.length} Bean candidates, please use @Qualifier or rename parameter to match bean name, to specify which Bean should be injected`,
                    filePath: contextDescriptor.absolutePath,
                    relatedContextPath: contextDescriptor.absolutePath,
                });
                return;
            }

            if (beanCandidatesFromGlobalContext.length === 1) {
                dependencies.add({
                    parameterName,
                    qualifiedType,
                    beanDescriptors: new ExtendedSet(beanCandidatesFromGlobalContext)
                });
                return;
            }

            if (beanCandidatesFromGlobalContext.length > 1) {
                const beanCandidatesFromGlobalContextQualifiedByParameterName = beanCandidatesFromGlobalContext
                    .filter(it => it.classMemberName === parameterName);

                if (beanCandidatesFromGlobalContextQualifiedByParameterName.length === 1) {
                    dependencies.add({
                        parameterName,
                        qualifiedType,
                        beanDescriptors: new ExtendedSet(beanCandidatesFromGlobalContextQualifiedByParameterName)
                    });
                    return;
                }

                if (beanCandidatesFromGlobalContextQualifiedByParameterName.length > 1) {
                    CompilationContext.reportErrorWithMultipleNodes({
                        nodes: [
                            parameter,
                            ...beanCandidatesFromGlobalContextQualifiedByParameterName.map(it => it.node),
                        ],
                        message: `Found ${beanCandidatesFromGlobalContextQualifiedByParameterName.length} Bean candidates in Global context, with same name, please rename one of beans`,
                        filePath: contextDescriptor.absolutePath,
                        relatedContextPath: contextDescriptor.absolutePath,
                    });
                    return;
                }

                CompilationContext.reportErrorWithMultipleNodes({
                    nodes: [
                        parameter,
                        ...beanCandidatesFromGlobalContext.map(it => it.node),
                    ],
                    message: `Found ${beanCandidatesFromGlobalContext.length} Bean candidates in Global context, please use @Qualifier or rename parameter to match bean name, to specify which Bean should be injected`,
                    filePath: contextDescriptor.absolutePath,
                    relatedContextPath: contextDescriptor.absolutePath,
                });
                return;
            }

            return;
        }
    });

    LifecycleMethodsRepository.register(contextDescriptor, {
        types: lifecycles,
        dependencies,
        nodeKind: lifecycleNodeKind,
        node,
        classMemberName,
        contextDescriptor,
    });
};
