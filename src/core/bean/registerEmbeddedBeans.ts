import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { restrictedClassMemberNames } from './constants';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { BeanRepository } from './BeanRepository';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { IncorrectNameError } from '../../exceptions/compilation/errors/IncorrectNameError';
import { MissingTypeDefinitionError } from '../../exceptions/compilation/errors/MissingTypeDefinitionError';
import { IncorrectTypeDefinitionError } from '../../exceptions/compilation/errors/IncorrectTypeDefinitionError';
import { TypeQualifyError } from '../../exceptions/compilation/errors/TypeQualifyError';

export const registerEmbeddedBean = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    classElement: ts.PropertyDeclaration
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

    const classElementType = classElement.type ?? null;

    if (classElementType === null) {
        compilationContext.report(new MissingTypeDefinitionError(
            null,
            classElement,
            contextDescriptor.node,
        ));
        return;
    }

    if (!ts.isTypeReferenceNode(classElementType)) {
        compilationContext.report(new IncorrectTypeDefinitionError(
            'Should be an interface reference.',
            classElementType,
            contextDescriptor.node,
        ));
        return;
    }

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(classElementType.getSourceFile(), classElementType.getText());

    if (nodeSourceDescriptor === null || nodeSourceDescriptor.node === null) {
        compilationContext.report(new TypeQualifyError(
            null,
            classElementType,
            contextDescriptor.node,
        ));
        return;
    }

    if (!ts.isInterfaceDeclaration(nodeSourceDescriptor.node)) {
        compilationContext.report(new IncorrectTypeDefinitionError(
            'Referenced type should be an interface declaration with statically known members.',
            classElementType,
            contextDescriptor.node,
        ));
        return;
    }

    const interfaceMembers = nodeSourceDescriptor.node.members;

    if (!isPropertySignatureList(interfaceMembers)) {
        compilationContext.report(new IncorrectTypeDefinitionError(
            'Referenced type should be an interface declaration with statically known members.',
            classElementType,
            contextDescriptor.node,
        ));
        return;
    }

    interfaceMembers.forEach(node => {
        const propertyName = node.name.getText();
        const propertyType = node.type;

        if (!propertyType) {
            compilationContext.report(
                new MissingTypeDefinitionError(
                    null,
                    node,
                    contextDescriptor.node,
                )
            );
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
            nestedProperty: propertyName,
            contextDescriptor,
            qualifiedType,
            scope: 'singleton',
            node: classElement,
            beanKind: 'embedded',
            beanSourceLocation: null,
            isPublic: false,
        });
    });


    const qualifiedType = TypeQualifier.qualify(compilationContext, contextDescriptor, classElementType);

    if (qualifiedType === null) {
        compilationContext.report(
            new MissingTypeDefinitionError(
                null,
                classElementType,
                contextDescriptor.node,
            )
        );
        return;
    }

    BeanRepository.registerBean({
        classMemberName: classElement.name.getText(),
        nestedProperty: null,
        contextDescriptor,
        qualifiedType,
        scope: 'singleton',
        node: classElement,
        beanKind: 'embedded',
        beanSourceLocation: null,
        isPublic: false,
    });
};

function isPropertySignatureList(list: ts.NodeArray<ts.TypeElement>): list is ts.NodeArray<ts.PropertySignature> {
    return list.every(it => ts.isPropertySignature(it));
}
