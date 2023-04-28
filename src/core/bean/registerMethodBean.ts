import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { getPropertyDecoratorBeanInfo } from '../ts-helpers/bean-info/getPropertyDecoratorBeanInfo';
import { BeanRepository } from './BeanRepository';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { MissingInitializerError } from '../../compilation-context/messages/errors/MissingInitializerError';
import { MissingTypeDefinitionError } from '../../compilation-context/messages/errors/MissingTypeDefinitionError';
import { TypeQualifyError } from '../../compilation-context/messages/errors/TypeQualifyError';

export const registerMethodBean = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    classElement: ts.MethodDeclaration,
): void => {
    if (classElement.body === undefined) {
        compilationContext.report(new MissingInitializerError(
            'Method Bean should have a body.',
            classElement.name,
            contextDescriptor.node,
        ));
        return;
    }

    const methodReturnType = classElement.type ?? null;
    const beanInfo = getPropertyDecoratorBeanInfo(compilationContext, contextDescriptor, classElement);

    if (methodReturnType === null) {
        compilationContext.report(new MissingTypeDefinitionError(
            null,
            classElement,
            contextDescriptor.node,
        ));
        return;
    }

    const qualifiedType = TypeQualifier.qualify(compilationContext, contextDescriptor, methodReturnType);

    if (qualifiedType === null) {
        compilationContext.report(new TypeQualifyError(
            null,
            methodReturnType,
            contextDescriptor.node,
        ));
        return;
    }

    BeanRepository.registerBean({
        classMemberName: classElement.name.getText(),
        nestedProperty: null,
        contextDescriptor,
        qualifiedType: qualifiedType,
        scope: beanInfo.scope,
        node: classElement,
        beanKind: 'method',
        beanImplementationSource: null,
        publicInfo: null,
    });
};
