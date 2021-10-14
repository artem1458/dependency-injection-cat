import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getPropertyDecoratorBeanInfo } from '../ts-helpers/bean-info/getPropertyDecoratorBeanInfo';
import { BeanRepository } from './BeanRepository';
import { restrictedClassMemberNames } from './constants';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';

export const registerMethodBean = (contextDescriptor: IContextDescriptor, classElement: ts.MethodDeclaration): void => {
    const classElementName = classElement.name.getText();

    if (restrictedClassMemberNames.includes(classElementName)) {
        CompilationContext.reportError({
            node: classElement,
            message: `${classElementName} method is reserved for the di-container, please use another name instead`,
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }
    if (classElement.body === undefined) {
        CompilationContext.reportError({
            node: classElement,
            message: 'Method Bean should have a body',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    const methodReturnType = classElement.type ?? null;
    const beanInfo = getPropertyDecoratorBeanInfo(classElement);

    if (methodReturnType === null) {
        CompilationContext.reportError({
            node: classElement,
            message: 'Can\'t qualify type of Bean, please specify type explicitly',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    const qualifiedType = TypeQualifier.qualify(methodReturnType);

    if (qualifiedType === null) {
        CompilationContext.reportError({
            node: classElement,
            message: 'Can\'t qualify type of Bean',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    BeanRepository.registerBean({
        classMemberName: classElement.name.getText(),
        contextDescriptor,
        qualifiedType: qualifiedType,
        scope: beanInfo.scope,
        node: classElement,
        beanKind: 'method',
        beanSourceLocation: null,
        isPublic: false,
    });
};
