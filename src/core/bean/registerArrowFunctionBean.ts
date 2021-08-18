import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { typeQualifier } from '../ts-helpers/type-qualifier/typeQualifier';
import { getPropertyDecoratorBeanInfo } from '../ts-helpers/bean-info/getPropertyDecoratorBeanInfo';
import { BeanRepository } from './BeanRepository';
import { IQualifiedType } from '../ts-helpers/type-qualifier/types';
import { restrictedBeanNames } from './constants';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';

export const registerArrowFunctionBean = (contextDescriptor: IContextDescriptor, classElement: ClassPropertyArrowFunction): void => {
    const classElementName = classElement.name.getText();

    if (restrictedBeanNames.includes(classElementName)) {
        CompilationContext.reportError({
            node: classElement,
            message: `${classElementName} method is reserved for the di-container, please use another name instead`,
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    const typeInfo = getBeanTypeInfoFromArrowFunction(contextDescriptor, classElement);
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
        typeNode: typeInfo.typeNode,
        beanKind: 'arrowFunction',
        beanSourceLocation: null,
        isPublic: false,
    });
};

function getBeanTypeInfoFromArrowFunction(contextDescriptor: IContextDescriptor, classElement: ClassPropertyArrowFunction): IQualifiedTypeWithTypeNode | null {
    const functionReturnType = classElement.initializer.type ?? null;

    if (functionReturnType !== null) {
        const qualified = typeQualifier(functionReturnType);

        return qualified ?
            {
                ...qualified,
                typeNode: functionReturnType,
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
