import ts, { factory } from 'typescript';
import upath from 'upath';
import { IContainerAccessNode } from './isContainerAccess';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { getContextNameFromContainerCall } from './getContextNameFromContainerCall';
import { ContextRepository } from '../../context/ContextRepository';
import { CONTEXT_POOL_POSTFIX } from '../../build-context/transformers/addContextPool';
import { getBuiltContextDirectory } from '../../build-context/utils/getBuiltContextDirectory';
import { validContainerKeys } from './validContainerKeys';
import { checkBeansInterface } from './checkBeansInterface';

export const replaceContainerCall = (node: IContainerAccessNode, factoryImportsToAdd: ts.ImportDeclaration[]): ts.Node => {
    if (!validContainerKeys.includes(node.expression.name.getText())) {
        CompilationContext.reportError({
            node: node,
            message: `Container has only following methods: ${validContainerKeys.join(', ')}`,
        });
        return node;
    }

    const contextName = getContextNameFromContainerCall(node);

    if (contextName === null) {
        return node;
    }

    const contextDescriptor = ContextRepository.getContextByName(contextName);

    if (contextDescriptor === null) {
        CompilationContext.reportError({
            node,
            message: `Context with name "${contextName}" not found`,
        });
        return node;
    }

    checkBeansInterface(node, contextDescriptor);

    const relativePathToExternalDirectory = upath.relative(
        upath.dirname(node.getSourceFile().fileName),
        getBuiltContextDirectory(),
    );
    const importPath = `./${
        upath.join(
            relativePathToExternalDirectory,
            `context_${contextDescriptor.id}`
        )
    }`;
    const importNamespaceName = `${contextDescriptor.name}${CONTEXT_POOL_POSTFIX}`;
    const importDeclaration = factory.createImportDeclaration(
        undefined,
        undefined,
        factory.createImportClause(
            false,
            undefined,
            factory.createNamespaceImport(
                factory.createIdentifier(importNamespaceName),
            )
        ),
        factory.createStringLiteral(importPath)
    );
    factoryImportsToAdd.push(importDeclaration);

    return factory.updateCallExpression(
        node,
        factory.createPropertyAccessExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier(importNamespaceName),
                factory.createIdentifier(importNamespaceName)
            ),
            node.expression.name,
        ),
        node.typeArguments,
        node.arguments
    );
};
