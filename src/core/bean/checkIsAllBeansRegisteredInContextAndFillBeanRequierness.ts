import { ContextRepository, IContextDescriptor } from '../context/ContextRepository';
import ts from 'typescript';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { unquoteString } from '../utils/unquoteString';
import { BeanRepository, IBeanDescriptorWithId } from './BeanRepository';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { MissingTypeDefinitionError } from '../../compilation-context/messages/errors/MissingTypeDefinitionError';
import { TypeQualifyError } from '../../compilation-context/messages/errors/TypeQualifyError';
import { IncorrectTypeDefinitionError } from '../../compilation-context/messages/errors/IncorrectTypeDefinitionError';
import { MissingBeanDeclarationError } from '../../compilation-context/messages/errors/MissingBeanDeclarationError';

export const checkIsAllBeansRegisteredInContextAndFillBeanRequierness = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor
) => {
    const extendsHeritageClause = contextDescriptor.node.heritageClauses
        ?.find(clause => clause.token === ts.SyntaxKind.ExtendsKeyword);

    if (!extendsHeritageClause) {
        return;
    }

    const typeArgs = extendsHeritageClause.types[0].typeArguments ?? null;

    if (typeArgs === null || !typeArgs[0]) {
        //If no type args - assuming that all beans are "private"
        return;
    }

    const type = typeArgs[0];

    if (!type || !ts.isTypeReferenceNode(type)) {
        compilationContext.report(new IncorrectTypeDefinitionError(
            'Should be an interface reference.',
            type,
            contextDescriptor.node,
        ));
        return;
    }

    const nodeDescriptor = getNodeSourceDescriptorDeep(
        contextDescriptor.node.getSourceFile(),
        type.typeName.getText(),
    );

    if (nodeDescriptor === null || nodeDescriptor.node === null) {
        compilationContext.report(new TypeQualifyError(
            null,
            type,
            contextDescriptor.node,
        ));
        return;
    }

    if (!ts.isInterfaceDeclaration(nodeDescriptor.node)) {
        compilationContext.report(new IncorrectTypeDefinitionError(
            'Referenced type should be an interface declaration with statically known members.',
            type,
            contextDescriptor.node,
        ));
        return;
    }

    if (nodeDescriptor.node.heritageClauses !== undefined) {
        compilationContext.report(new IncorrectTypeDefinitionError(
            'Referenced type should be an interface declaration with statically known members.',
            type,
            contextDescriptor.node,
        ));
        return;
    }

    if (nodeDescriptor.node.members.some(it => !ts.isPropertySignature(it))) {
        compilationContext.report(new IncorrectTypeDefinitionError(
            'Referenced type should be an interface declaration with statically known members.',
            type,
            contextDescriptor.node,
        ));
        return;
    }

    ContextRepository.registerContextInterface(contextDescriptor, nodeDescriptor.node, nodeDescriptor);

    const requiredBeanProperties: ts.PropertySignature[] = nodeDescriptor.node.members.map((it) => it as ts.PropertySignature);

    const contextBeans = BeanRepository
        .beanDescriptorRepository.get(contextDescriptor.name) ?? new Map<string, IBeanDescriptorWithId[]>();

    const missingBeans: ts.PropertySignature[] = [];

    requiredBeanProperties.forEach(requiredBeanProperty => {
        if (!requiredBeanProperty.type) {
            compilationContext.report(
                new MissingTypeDefinitionError(
                    null,
                    requiredBeanProperty,
                    contextDescriptor.node,
                )
            );
            return;
        }

        const requiredBeanName = unquoteString(requiredBeanProperty.name.getText());
        const qualifiedPropertyType = TypeQualifier.qualify(compilationContext, contextDescriptor, requiredBeanProperty.type);

        if (qualifiedPropertyType === null) {
            compilationContext.report(new TypeQualifyError(
                null,
                requiredBeanProperty.type,
                contextDescriptor.node,
            ));
            return;
        }

        const requiredBeanDescriptor = contextBeans.get(qualifiedPropertyType.fullTypeId)
            ?.find(it => it.classMemberName === requiredBeanName && it.qualifiedType.kind === qualifiedPropertyType.kind);

        if (requiredBeanDescriptor) {
            requiredBeanDescriptor.publicInfo = {
                publicNode: requiredBeanProperty,
            };
        } else {
            missingBeans.push(requiredBeanProperty);
        }
    });

    if (missingBeans.length > 0) {
        missingBeans.forEach(it => {
            compilationContext.report(new MissingBeanDeclarationError(
                null,
                it,
                contextDescriptor.node,
            ));
        });
        return;
    }
};
