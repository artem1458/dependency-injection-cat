import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getPropertyDecoratorBeanInfo } from '../ts-helpers/bean-info/getPropertyDecoratorBeanInfo';
import { BeanRepository } from './BeanRepository';
import { restrictedClassMemberNames } from './constants';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { CompilationContext2 } from '../../compilation-context/CompilationContext2';
import { IncorrectNameError } from '../../exceptions/compilation/errors/IncorrectNameError';
import { MissingInitializerError } from '../../exceptions/compilation/errors/MissingInitializerError';
import { MissingTypeDefinitionError } from '../../exceptions/compilation/errors/MissingTypeDefinitionError';
import { TypeQualifyError } from '../../exceptions/compilation/errors/TypeQualifyError';

export const registerMethodBean = (
    compilationContext: CompilationContext2,
    contextDescriptor: IContextDescriptor,
    classElement: ts.MethodDeclaration,
): void => {
    const classElementName = classElement.name.getText();

    if (restrictedClassMemberNames.has(classElementName)) {
        compilationContext.report(new IncorrectNameError(
            `${classElementName} name is reserved for the di-container.`,
            classElement.name,
            contextDescriptor.node,
        ));
        return;
    }
    if (classElement.body === undefined) {
        compilationContext.report(new MissingInitializerError(
            'Method Bean should have a body',
            classElement.name,
            contextDescriptor.node,
        ));
        return;
    }

    const methodReturnType = classElement.type ?? null;
    const beanInfo = getPropertyDecoratorBeanInfo(classElement);

    if (methodReturnType === null) {
        compilationContext.report(new MissingTypeDefinitionError(
            null,
            classElement,
            contextDescriptor.node,
        ));
        return;
    }

    const qualifiedType = TypeQualifier.qualify(methodReturnType);

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
        beanSourceLocation: null,
        isPublic: false,
    });
};
