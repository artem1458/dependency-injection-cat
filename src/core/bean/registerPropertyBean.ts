import * as ts from 'typescript';
import { factory } from 'typescript';
import { isEqual } from 'lodash';
import { IContextDescriptor } from '../context/ContextRepository';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { getPropertyBeanInfo } from '../ts-helpers/bean-info/getPropertyBeanInfo';
import { BeanRepository } from './BeanRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { restrictedClassMemberNames } from './constants';
import { QualifiedType } from '../ts-helpers/type-qualifier/QualifiedType';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { ExtendedSet } from '../utils/ExtendedSet';

export const registerPropertyBean = (contextDescriptor: IContextDescriptor, classElement: ClassPropertyDeclarationWithInitializer): void => {
    const classElementName = classElement.name.getText();

    if (restrictedClassMemberNames.has(classElementName)) {
        CompilationContext.reportError({
            node: classElement,
            message: `"${classElementName}" property is reserved for the di-container, please use another name instead`,
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    const qualifiedType = getBeanTypeInfoFromClassProperty(contextDescriptor, classElement);
    const beanInfo = getPropertyBeanInfo(classElement);

    if (qualifiedType === null) {
        return;
    }

    BeanRepository.registerBean({
        classMemberName: classElement.name.getText(),
        contextDescriptor,
        scope: beanInfo.scope,
        qualifiedType: qualifiedType,
        node: classElement,
        beanKind: 'property',
        //Will be assigned when resolving dependencies
        beanSourceLocation: null,
        isPublic: false,
    });
};

function getBeanTypeInfoFromClassProperty(contextDescriptor: IContextDescriptor, classElement: ClassPropertyDeclarationWithInitializer): QualifiedType | null {
    const propertyType = classElement.type ?? null;
    const beanGenericType = (classElement.initializer.typeArguments ?? [])[0] ?? null;

    if (propertyType !== null && beanGenericType !== null) {
        //TODO add caching of type nodes in typeQualifier
        const resolvedPropertyType = TypeQualifier.qualify(propertyType);
        const resolvedBeanGenericType = TypeQualifier.qualify(beanGenericType);

        if (resolvedPropertyType === null && resolvedBeanGenericType === null) {
            return null;
        }

        if (resolvedPropertyType !== null && resolvedBeanGenericType !== null && isEqual(resolvedPropertyType.typeIds, resolvedBeanGenericType.typeIds)) {
            return resolvedBeanGenericType;
        } else {
            CompilationContext.reportError({
                node: beanGenericType,
                message: 'Bean generic type and property type should be equal',
                filePath: contextDescriptor.absolutePath,
                relatedContextPath: contextDescriptor.absolutePath,
            });
        }

        if (resolvedBeanGenericType !== null) {
            return resolvedBeanGenericType;
        }

        if (resolvedPropertyType !== null) {
            return resolvedPropertyType;
        }
    }

    if (propertyType === null && beanGenericType !== null) {
        return TypeQualifier.qualify(beanGenericType);
    }

    if (beanGenericType === null && propertyType !== null) {
        return TypeQualifier.qualify(propertyType);
    }

    const firstArgument = classElement.initializer.arguments[0];

    if (!ts.isIdentifier(firstArgument)) {
        CompilationContext.reportError({
            node: firstArgument,
            message: 'First argument in property bean should be a class reference',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
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
            message: 'Can\'t qualify type of Bean, please specify type explicitly',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });

        return null;
    }

    const typeReferenceFullName = `${nodeSourceDescriptor.name}${nodeSourceDescriptor.path}`;

    const qualifiedType = new QualifiedType();
    qualifiedType.typeIds = new ExtendedSet([typeReferenceFullName]);
    qualifiedType.fullTypeId = typeReferenceFullName;
    qualifiedType.typeNode = factory.createTypeReferenceNode(
        factory.createIdentifier(firstArgument.getText()),
    );

    return qualifiedType;
}
