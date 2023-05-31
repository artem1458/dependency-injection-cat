import ts from 'typescript';
import { IContextDescriptor } from '../context/ContextRepository';
import {
    ILifecycleDependencyDescriptor,
    LifecycleMethodsRepository,
    TLifecycleNodeKind
} from './LifecycleMethodsRepository';
import { getParameterType } from '../bean-dependencies/getParameterType';
import { BeanRepository } from '../bean/BeanRepository';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import { TLifecycle } from '../../external/InternalCatContext';
import { QualifiedTypeKind } from '../ts-helpers/type-qualifier/QualifiedType';
import { ExtendedSet } from '../utils/ExtendedSet';
import { uniqNotEmpty } from '../utils/uniqNotEmpty';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { TypeQualifyError } from '../../compilation-context/messages/errors/TypeQualifyError';
import { DependencyResolvingError } from '../../compilation-context/messages/errors/DependencyResolvingError';
import { unquoteString } from '../utils/unquoteString';
import { getFormattedParameterNameAndType } from '../utils/getFormattedParameterNameAndType';

export const registerLifecycleExpression = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    classMemberName: string,
    node: ClassPropertyArrowFunction | ts.MethodDeclaration,
    lifecycles: Set<TLifecycle>,
    lifecycleNodeKind: TLifecycleNodeKind,
) => {
    const beansMap = BeanRepository.beanDescriptorRepository.get(contextDescriptor.name);

    if (!beansMap) {
        return;
    }

    const dependencies = new ExtendedSet<ILifecycleDependencyDescriptor>();

    const parameters = ts.isMethodDeclaration(node) ? node.parameters : node.initializer.parameters;

    parameters.forEach(parameter => {
        const parameterName = unquoteString(parameter.name.getText());
        const qualifiedType = getParameterType(compilationContext, contextDescriptor, parameter);

        if (qualifiedType === null) {
            compilationContext.report(new TypeQualifyError(
                null,
                parameter,
                contextDescriptor.node
            ));
            return;
        }

        if (qualifiedType.kind === QualifiedTypeKind.LIST) {
            const beansFromCurrentContext = beansMap.get(qualifiedType.fullTypeId) ?? [];
            const uniqBeans = uniqNotEmpty(beansFromCurrentContext);

            if (uniqBeans.length === 0) {
                compilationContext.report(new DependencyResolvingError(
                    `Can not find Bean candidates for ${parameterName}.`,
                    parameter,
                    contextDescriptor.node,
                ));
                return;
            }

            dependencies.add({
                qualifiedType,
                parameterName,
                qualifiedBeans: new ExtendedSet(uniqBeans),
                node: parameter,
            });
            return;
        }

        if (qualifiedType.kind === QualifiedTypeKind.PLAIN) {
            const currentContextBeans = beansMap.get(qualifiedType.fullTypeId) ?? [];
            const currentContextNonEmbeddedBeans = currentContextBeans.filter(it => it.beanKind !== 'embedded');
            const currentContextEmbeddedBeans = currentContextBeans.filter(it => it.beanKind === 'embedded');

            const nonEmbeddedBeanCandidatesFromCurrentContext = uniqNotEmpty(currentContextNonEmbeddedBeans);
            const embeddedBeanCandidatesFromCurrentContext = uniqNotEmpty(currentContextEmbeddedBeans);

            if (
                nonEmbeddedBeanCandidatesFromCurrentContext.length === 0
                && embeddedBeanCandidatesFromCurrentContext.length === 0
            ) {
                compilationContext.report(new DependencyResolvingError(
                    `Can not find Bean candidate for parameter "${getFormattedParameterNameAndType(parameterName, qualifiedType)}".`,
                    parameter,
                    contextDescriptor.node,
                ));
                return;
            }

            //<editor-fold desc="Trying to find in current context (not-embedded Beans)">
            if (nonEmbeddedBeanCandidatesFromCurrentContext.length === 1) {
                dependencies.add({
                    parameterName,
                    qualifiedType,
                    qualifiedBeans: new ExtendedSet(nonEmbeddedBeanCandidatesFromCurrentContext),
                    node: parameter,
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
                        qualifiedBeans: new ExtendedSet(beanCandidatesFromCurrentContextQualifiedByParameterName),
                        node: parameter,
                    });
                    return;
                }

                if (beanCandidatesFromCurrentContextQualifiedByParameterName.length > 1) {
                    compilationContext.report(new DependencyResolvingError(
                        `Found ${beanCandidatesFromCurrentContextQualifiedByParameterName.length} candidates for parameter "${getFormattedParameterNameAndType(parameterName, qualifiedType)}". Rename parameter or use @Qualifier to match Bean name, to specify which Bean should be injected.`,
                        parameter,
                        contextDescriptor.node,
                    ));
                    return;
                }

                compilationContext.report(new DependencyResolvingError(
                    `Found ${nonEmbeddedBeanCandidatesFromCurrentContext.length} candidates for parameter "${getFormattedParameterNameAndType(parameterName, qualifiedType)}". Rename parameter or use @Qualifier to match Bean name, to specify which Bean should be injected.`,
                    parameter,
                    contextDescriptor.node,
                ));
                return;
            }
            //</editor-fold>

            //<editor-fold desc="Trying to find in current context (embedded Beans)">
            if (embeddedBeanCandidatesFromCurrentContext.length === 1) {
                dependencies.add({
                    parameterName,
                    qualifiedType,
                    qualifiedBeans: new ExtendedSet(embeddedBeanCandidatesFromCurrentContext),
                    node: parameter,
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
                        qualifiedBeans: new ExtendedSet(beansByParameterName),
                        node: parameter,
                    });
                    return;
                }

                if (beansByParameterName.length > 1) {
                    compilationContext.report(new DependencyResolvingError(
                        `Found ${beansByParameterName.length} EmbeddedBean candidates for parameter "${getFormattedParameterNameAndType(parameterName, qualifiedType)}". Rename parameter or use @Qualifier to match Bean name, to specify which Bean should be injected.`,
                        parameter,
                        contextDescriptor.node,
                    ));
                    return;
                }

                compilationContext.report(new DependencyResolvingError(
                    `Found ${embeddedBeanCandidatesFromCurrentContext.length} EmbeddedBean candidates for parameter "${getFormattedParameterNameAndType(parameterName, qualifiedType)}". Rename parameter or use @Qualifier to match Bean name, to specify which Bean should be injected.`,
                    parameter,
                    contextDescriptor.node,
                ));
                return;
            }
            //</editor-fold>
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
