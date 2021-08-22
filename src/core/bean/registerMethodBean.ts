import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { typeQualifier } from '../ts-helpers/type-qualifier/typeQualifier';
import { getPropertyDecoratorBeanInfo } from '../ts-helpers/bean-info/getPropertyDecoratorBeanInfo';
import { BeanRepository } from './BeanRepository';
import { IQualifiedType } from '../ts-helpers/type-qualifier/types';
import { restrictedClassMemberNames } from './constants';

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

    const typeInfo = getBeanTypeInfoFromMethod(contextDescriptor, classElement);
    const beanInfo = getPropertyDecoratorBeanInfo(classElement);

    if (typeInfo === null) {
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
        type: typeInfo.typeId,
        originalTypeName: typeInfo.originalTypeName,
        scope: beanInfo.scope,
        node: classElement,
        typeNode: classElement.type!,
        beanKind: 'method',
        beanSourceLocation: null,
        isPublic: false,
    });
};

function getBeanTypeInfoFromMethod(contextDescriptor: IContextDescriptor, classElement: ts.MethodDeclaration): IQualifiedTypeWithTypeNode | null {
    const methodReturnType = classElement.type ?? null;

    if (methodReturnType !== null) {
        const qualified = typeQualifier(methodReturnType);

        return qualified ?
            {
                ...qualified,
                typeNode: methodReturnType,
            }
            : null;
    } else {
        CompilationContext.reportError({
            node: classElement,
            message: 'Can\'t qualify type of Bean, please specify type explicitly',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });

        return null;
    }
}

interface IQualifiedTypeWithTypeNode extends IQualifiedType {
    typeNode: ts.TypeNode;
}
