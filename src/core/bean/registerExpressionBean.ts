import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { typeQualifier } from '../ts-helpers/type-qualifier/typeQualifier';
import { getPropertyDecoratorBeanInfo } from '../ts-helpers/bean-info/getPropertyDecoratorBeanInfo';
import { BeanRepository } from './BeanRepository';
import { IQualifiedType } from '../ts-helpers/type-qualifier/types';
import { restrictedBeanNames } from './constants';

export const registerExpressionBean = (contextDescriptor: IContextDescriptor, classElement: ts.PropertyDeclaration): void => {
    const classElementName = classElement.name.getText();

    if (restrictedBeanNames.includes(classElementName)) {
        CompilationContext.reportError({
            node: classElement,
            message: `${classElementName} name is reserved for the di-container, please use another name instead`,
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    const typeInfo = getBeanTypeInfoFromExpressionBean(contextDescriptor, classElement);
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
        beanKind: 'expression',
        beanSourceLocation: null,
        isPublic: false,
    });
};

function getBeanTypeInfoFromExpressionBean(contextDescriptor: IContextDescriptor, classElement: ts.PropertyDeclaration): IQualifiedTypeWithTypeNode | null {
    const propertyType = classElement.type ?? null;

    if (propertyType !== null) {
        const qualified = typeQualifier(propertyType);

        return qualified ?
            {
                ...qualified,
                typeNode: propertyType,
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
