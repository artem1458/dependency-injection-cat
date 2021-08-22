import ts from 'typescript';
import { IContextDescriptor } from '../context/ContextRepository';
import { LifecycleMethodsRepository, TLifecycle } from './LifecycleMethodsRepository';
import { getQualifierValueFromFunctionArgument } from '../bean-dependencies/getQualifierValueFromFunctionArgument';
import { getParameterType } from '../bean-dependencies/getParameterType';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { BeanRepository, IBeanDescriptor } from '../bean/BeanRepository';
import { GLOBAL_CONTEXT_NAME } from '../context/constants';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';

export const registerLifecycleExpression = (
    contextDescriptor: IContextDescriptor,
    classMemberName: string,
    node: ClassPropertyArrowFunction | ts.MethodDeclaration,
    lifecycles: Set<TLifecycle>,
) => {
    const beansMap = BeanRepository.beanDescriptorRepository.get(contextDescriptor.name);

    if (!beansMap) {
        return;
    }

    const qualifiedBeanDescriptors = new Set<IBeanDescriptor>();

    let parameters: ts.NodeArray<ts.ParameterDeclaration>;

    if (ts.isMethodDeclaration(node)) {
        parameters = node.parameters;
    } else {
        parameters = node.initializer.parameters;
    }

    parameters.forEach(parameter => {
        const parameterName = parameter.name.getText();
        const qualifier = getQualifierValueFromFunctionArgument(parameter, contextDescriptor);
        const type = getParameterType(parameter);

        if (type === null) {
            CompilationContext.reportError({
                node: parameter,
                message: 'Can\'t qualify type of Context Lifecycle parameter',
                filePath: contextDescriptor.absolutePath,
                relatedContextPath: contextDescriptor.absolutePath,
            });
            return;
        }

        let beanCandidatesFromCurrentContext = beansMap.get(type.typeId) ?? [];
        let beanCandidatesFromGlobalContext = BeanRepository.beanDescriptorRepository
            .get(GLOBAL_CONTEXT_NAME)?.get(type.typeId) ?? [];

        if (qualifier !== null) {
            beanCandidatesFromCurrentContext = beanCandidatesFromCurrentContext
                .filter(it => it.classMemberName === qualifier);
            beanCandidatesFromGlobalContext = beanCandidatesFromGlobalContext
                .filter(it => it.classMemberName === qualifier);
        }

        if (beanCandidatesFromCurrentContext.length === 0 && beanCandidatesFromGlobalContext.length === 0) {
            CompilationContext.reportError({
                node: parameter,
                message: 'Bean for Context Lifecycle dependency is not registered',
                filePath: contextDescriptor.absolutePath,
                relatedContextPath: contextDescriptor.absolutePath,
            });
            return;
        }

        if (beanCandidatesFromCurrentContext.length === 1) {
            qualifiedBeanDescriptors.add(beanCandidatesFromCurrentContext[0]);
            return;
        }

        if (beanCandidatesFromCurrentContext.length > 1) {
            const beanCandidatesFromCurrentContextQualifiedByParameterName = beanCandidatesFromCurrentContext
                .filter(it => it.classMemberName === parameterName);

            if (beanCandidatesFromCurrentContextQualifiedByParameterName.length === 1) {
                qualifiedBeanDescriptors.add(beanCandidatesFromCurrentContextQualifiedByParameterName[0]);
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
                    ...beanCandidatesFromCurrentContext.map(it => it.node),
                ],
                message: `Found ${beanCandidatesFromCurrentContext.length} Bean candidates, please use @Qualifier or rename parameter to match bean name, to specify which Bean should be injected`,
                filePath: contextDescriptor.absolutePath,
                relatedContextPath: contextDescriptor.absolutePath,
            });
            return;
        }

        if (beanCandidatesFromGlobalContext.length === 1) {
            qualifiedBeanDescriptors.add(beanCandidatesFromGlobalContext[0]);
            return;
        }

        if (beanCandidatesFromGlobalContext.length > 1) {
            const beanCandidatesFromGlobalContextQualifiedByParameterName = beanCandidatesFromGlobalContext
                .filter(it => it.classMemberName === parameterName);

            if (beanCandidatesFromGlobalContextQualifiedByParameterName.length === 1) {
                qualifiedBeanDescriptors.add(beanCandidatesFromGlobalContextQualifiedByParameterName[0]);
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
    });

    LifecycleMethodsRepository.register(contextDescriptor, {
        types: lifecycles,
        dependencies: qualifiedBeanDescriptors,
        node,
        classMemberName
    });
};
