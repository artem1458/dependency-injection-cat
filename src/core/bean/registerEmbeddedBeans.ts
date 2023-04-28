import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { BeanRepository } from './BeanRepository';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { MissingTypeDefinitionError } from '../../compilation-context/messages/errors/MissingTypeDefinitionError';
import { IncorrectTypeDefinitionError } from '../../compilation-context/messages/errors/IncorrectTypeDefinitionError';
import { TypeQualifyError } from '../../compilation-context/messages/errors/TypeQualifyError';

export const registerEmbeddedBean = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    classElement: ts.PropertyDeclaration
): void => {
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
            beanImplementationSource: null,
            publicInfo: null,
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
        beanImplementationSource: null,
        publicInfo: null,
    });
};

function isPropertySignatureList(list: ts.NodeArray<ts.TypeElement>): list is ts.NodeArray<ts.PropertySignature> {
    return list.every(it => ts.isPropertySignature(it));
}
