import * as ts from 'typescript';
import { factory } from 'typescript';
import { isEqual } from 'lodash';
import { IContextDescriptor } from '../context/ContextRepository';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { getPropertyBeanInfo } from '../ts-helpers/bean-info/getPropertyBeanInfo';
import { BeanRepository } from './BeanRepository';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { restrictedClassMemberNames } from './constants';
import { QualifiedType } from '../ts-helpers/type-qualifier/QualifiedType';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { ExtendedSet } from '../utils/ExtendedSet';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { IncorrectNameError } from '../../exceptions/compilation/errors/IncorrectNameError';
import { IncorrectTypeDefinitionError } from '../../exceptions/compilation/errors/IncorrectTypeDefinitionError';
import { IncorrectArgumentError } from '../../exceptions/compilation/errors/IncorrectArgumentError';
import { TypeQualifyError } from '../../exceptions/compilation/errors/TypeQualifyError';
import { MissingTypeDefinitionError } from '../../exceptions/compilation/errors/MissingTypeDefinitionError';

export const registerPropertyBean = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    classElement: ClassPropertyDeclarationWithInitializer,
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

    const qualifiedType = getBeanTypeInfoFromClassProperty(compilationContext, contextDescriptor, classElement);
    const beanInfo = getPropertyBeanInfo(compilationContext, contextDescriptor, classElement);

    if (qualifiedType === null) {
        compilationContext.report(new TypeQualifyError(
            null,
            classElement,
            contextDescriptor.node,
        ));
        return;
    }

    BeanRepository.registerBean({
        classMemberName: classElement.name.getText(),
        nestedProperty: null,
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

function getBeanTypeInfoFromClassProperty(
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    classElement: ClassPropertyDeclarationWithInitializer
): QualifiedType | null {
    const propertyType = classElement.type ?? null;
    const beanGenericType = (classElement.initializer.typeArguments ?? [])[0] ?? null;

    if (propertyType !== null && beanGenericType !== null) {
        //TODO add caching of type nodes in typeQualifier
        const resolvedPropertyType = TypeQualifier.qualify(compilationContext, contextDescriptor, propertyType);
        const resolvedBeanGenericType = TypeQualifier.qualify(compilationContext, contextDescriptor, beanGenericType);

        if (resolvedPropertyType === null && resolvedBeanGenericType === null) {
            return null;
        }

        if (resolvedPropertyType !== null && resolvedBeanGenericType !== null && isEqual(resolvedPropertyType.typeIds, resolvedBeanGenericType.typeIds)) {
            return resolvedBeanGenericType;
        } else {
            compilationContext.report(new IncorrectTypeDefinitionError(
                'Generic type and property types should be the same.',
                classElement,
                contextDescriptor.node,
            ));
        }

        if (resolvedBeanGenericType !== null) {
            return resolvedBeanGenericType;
        }

        if (resolvedPropertyType !== null) {
            return resolvedPropertyType;
        }
    }

    if (propertyType === null && beanGenericType !== null) {
        return TypeQualifier.qualify(compilationContext, contextDescriptor, beanGenericType);
    }

    if (beanGenericType === null && propertyType !== null) {
        return TypeQualifier.qualify(compilationContext, contextDescriptor, propertyType);
    }

    const firstArgument = classElement.initializer.arguments[0];

    if (!ts.isIdentifier(firstArgument)) {
        compilationContext.report(new IncorrectArgumentError(
            'Argument should be a class reference.',
            firstArgument,
            contextDescriptor.node,
        ));
        return null;
    }

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(
        firstArgument.getSourceFile(),
        firstArgument.getText()
    );

    if (nodeSourceDescriptor === null) {
        compilationContext.report(
            new MissingTypeDefinitionError(
                null,
                classElement,
                contextDescriptor.node,
            )
        );
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
