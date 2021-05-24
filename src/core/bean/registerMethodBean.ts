import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { typeQualifier } from '../ts-helpers/type-qualifier/typeQualifier';
import { getMethodBeanInfo } from '../ts-helpers/bean-info/getMethodBeanInfo';
import { BeanRepository } from './BeanRepository';
import { IQualifiedType } from '../ts-helpers/type-qualifier/types';

export const registerMethodBean = (contextDescriptor: IContextDescriptor, classElement: ts.MethodDeclaration): void => {
    if (classElement.name.getText() === 'getBean') {
        CompilationContext.reportError({
            node: classElement,
            message: '"getBean" method is reserved for the di-container, please use another name instead',
            filePath: contextDescriptor.absolutePath,
        });
        return;
    }
    if (classElement.body === undefined) {
        CompilationContext.reportError({
            node: classElement,
            message: 'Method Bean should have a body',
            filePath: contextDescriptor.absolutePath,
        });
        return;
    }

    const typeInfo = getBeanTypeInfoFromMethod(contextDescriptor, classElement);
    const beanInfo = getMethodBeanInfo(classElement);

    if (typeInfo === null) {
        CompilationContext.reportError({
            node: classElement,
            message: 'Can\'t qualify type of Bean',
            filePath: contextDescriptor.absolutePath,
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
        beanSourceLocation: null
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
        });

        return null;
    }
}

interface IQualifiedTypeWithTypeNode extends IQualifiedType {
    typeNode: ts.TypeNode;
}
