import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { restrictedClassMemberNames } from './constants';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { BeanRepository } from './BeanRepository';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';

export const registerEmbeddedBean = (contextDescriptor: IContextDescriptor, classElement: ts.PropertyDeclaration): void => {
    const classElementName = classElement.name.getText();

    if (restrictedClassMemberNames.has(classElementName)) {
        CompilationContext.reportError({
            node: classElement,
            message: `${classElementName} name is reserved for the di-container, please use another name instead`,
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    const propertyType = classElement.type ?? null;

    if (propertyType === null) {
        CompilationContext.reportError({
            node: classElement,
            message: 'Can\'t qualify type of Embedded Bean, please specify type explicitly',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    if (!ts.isTypeReferenceNode(propertyType)) {
        CompilationContext.reportError({
            node: propertyType,
            message: 'Type of Embedded Bean should be a type reference',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(propertyType.getSourceFile(), propertyType.getText());

    if (!nodeSourceDescriptor?.node) {
        CompilationContext.reportError({
            node: propertyType,
            message: 'Can not find type of Embedded Bean',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    if (!ts.isInterfaceDeclaration(nodeSourceDescriptor.node)) {
        CompilationContext.reportError({
            node: propertyType,
            message: 'Type of Embedded Bean should be a plain interface declaration (without extends keyword)',
            filePath: nodeSourceDescriptor.path,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    const interfaceMembers = nodeSourceDescriptor.node.members;

    if (!isPropertySignatureList(interfaceMembers)) {
        CompilationContext.reportError({
            node: nodeSourceDescriptor.node,
            message: 'Type of Embedded Bean should be a plain interface declaration (without extends keyword)',
            filePath: nodeSourceDescriptor.path,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    interfaceMembers.forEach(node => {
        const propertyName = node.name.getText();
        const propertyType = node.type;

        if (!propertyType) {
            CompilationContext.reportError({
                node,
                message: 'Each interface element Embedded Bean type should have a type',
                filePath: nodeSourceDescriptor.path,
                relatedContextPath: contextDescriptor.absolutePath,
            });
            return;
        }

        const qualifiedType = TypeQualifier.qualify(propertyType);

        if (qualifiedType === null) {
            CompilationContext.reportError({
                node,
                message: 'Can\'t qualify type of Nested Bean element',
                filePath: nodeSourceDescriptor.path,
                relatedContextPath: contextDescriptor.absolutePath,
            });
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


    const qualifiedType = TypeQualifier.qualify(propertyType);

    if (qualifiedType === null) {
        CompilationContext.reportError({
            node: classElement,
            message: 'Can\'t qualify type of Embedded Bean',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    BeanRepository.registerBean({
        classMemberName: classElement.name.getText(),
        nestedProperty: null,
        contextDescriptor,
        qualifiedType,
        scope: 'singleton',
        node: classElement,
        beanKind: 'expression',
        beanSourceLocation: null,
        isPublic: false,
    });
};

function isPropertySignatureList(list: ts.NodeArray<ts.TypeElement>): list is ts.NodeArray<ts.PropertySignature> {
    return list.every(it => ts.isPropertySignature(it));
}
