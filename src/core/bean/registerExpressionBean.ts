import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { getPropertyDecoratorBeanInfo } from '../ts-helpers/bean-info/getPropertyDecoratorBeanInfo';
import { BeanRepository } from './BeanRepository';
import { restrictedClassMemberNames } from './constants';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { IncorrectNameError } from '../../compilation-context/messages/errors/IncorrectNameError';
import { MissingTypeDefinitionError } from '../../compilation-context/messages/errors/MissingTypeDefinitionError';
import { TypeQualifyError } from '../../compilation-context/messages/errors/TypeQualifyError';

export const registerExpressionBean = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    classElement: ts.PropertyDeclaration,
): void => {
    const classElementName = classElement.name.getText();

    if (restrictedClassMemberNames.has(classElementName)) {
        compilationContext.report(new IncorrectNameError(
            `"${classElementName}" name is reserved for the di-container.`,
            classElement.name,
            contextDescriptor.node,
        ));
        return;
    }

    const propertyType = classElement.type ?? null;
    const beanInfo = getPropertyDecoratorBeanInfo(compilationContext, contextDescriptor, classElement);

    if (propertyType === null) {
        compilationContext.report(new MissingTypeDefinitionError(
            null,
            classElement,
            contextDescriptor.node,
        ));
        return;
    }

    const qualifiedType = TypeQualifier.qualify(compilationContext, contextDescriptor, propertyType);

    if (qualifiedType === null) {
        compilationContext.report(new TypeQualifyError(
            null,
            propertyType,
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
        beanKind: 'expression',
        beanSourceLocation: null,
        isPublic: false,
    });
};
