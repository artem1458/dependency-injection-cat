import * as ts from 'typescript';
import { isEqual } from 'lodash';
import { IContextDescriptor } from '../context/ContextRepository';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { getPropertyBeanInfo } from '../ts-helpers/bean-info/getPropertyBeanInfo';
import { BeanRepository } from './BeanRepository';
import { IQualifiedType } from '../ts-helpers/type-qualifier/types';
import { typeQualifier } from '../ts-helpers/type-qualifier/typeQualifier';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { END_PATH_TOKEN, START_PATH_TOKEN } from '../ts-helpers/type-qualifier/parseTokens';

export const registerPropertyBean = (contextDescriptor: IContextDescriptor, classElement: ClassPropertyDeclarationWithInitializer): void => {
    if (classElement.name.getText() === 'getBean') {
        CompilationContext.reportError({
            node: classElement,
            message: '"getBean" property is reserved for the di-container, please use another name instead'
        });
        return;
    }

    const typeInfo = getBeanTypeInfoFromClassProperty(classElement);
    const beanInfo = getPropertyBeanInfo(classElement);

    if (typeInfo === null) {
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
        beanKind: 'property',
        //Will be assigned when resolving dependencies
        beanSourceLocation: null,
    });
};

function getBeanTypeInfoFromClassProperty(classElement: ClassPropertyDeclarationWithInitializer): IQualifiedTypeWithTypeNode | null {
    const propertyType = classElement.type ?? null;
    const beanGenericType = (classElement.initializer.typeArguments ?? [])[0] ?? null;

    if (propertyType !== null && beanGenericType !== null) {
        //TODO add caching of type nodes in typeQualifier
        const resolvedPropertyType = typeQualifier(propertyType);
        const resolvedBeanGenericType = typeQualifier(beanGenericType);

        if (resolvedPropertyType === null && resolvedBeanGenericType === null) {
            return null;
        }

        if (resolvedPropertyType !== null && resolvedBeanGenericType !== null && isEqual(resolvedPropertyType, resolvedBeanGenericType)) {
            return {
                ...resolvedBeanGenericType,
                typeNode: propertyType,
            };
        } else {
            CompilationContext.reportError({
                node: beanGenericType,
                message: 'Bean generic type and property type should be equal',
            });
        }

        if (resolvedBeanGenericType !== null) {
            return {
                ...resolvedBeanGenericType,
                typeNode: beanGenericType,
            };
        }

        if (resolvedPropertyType !== null) {
            return {
                ...resolvedPropertyType,
                typeNode: propertyType,
            };
        }
    }

    if (propertyType === null && beanGenericType !== null) {
        const qualified = typeQualifier(beanGenericType);

        return qualified ?
            {
                ...qualified,
                typeNode: beanGenericType,
            }
            : null;
    }

    if (beanGenericType === null && propertyType !== null) {
        const qualified = typeQualifier(propertyType);

        return qualified ?
            {
                ...qualified,
                typeNode: propertyType
            }
            : null;
    }

    const firstArgument = classElement.initializer.arguments[0];

    if (!ts.isIdentifier(firstArgument)) {
        CompilationContext.reportError({
            node: firstArgument,
            message: 'First argument in Property-Bean should be a class reference',
        });

        return null;
    }

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(
        firstArgument.getSourceFile(),
        firstArgument.getText()
    );

    if (nodeSourceDescriptor === null) {
        CompilationContext.reportError({
            node: firstArgument,
            message: 'Can\'t qualify type of Bean, please specify type explicitly'
        });

        return null;
    }

    return {
        originalTypeName: nodeSourceDescriptor.name,
        typeId: `${START_PATH_TOKEN}${nodeSourceDescriptor.path}${END_PATH_TOKEN}${nodeSourceDescriptor.name}`,
        typeNode: ts.factory.createTypeReferenceNode(firstArgument),
    };
}

interface IQualifiedTypeWithTypeNode extends IQualifiedType {
    typeNode: ts.TypeNode;
}
