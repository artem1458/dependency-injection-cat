import ts, { factory } from 'typescript';
import upath from 'upath';
import { IContainerAccessNode } from './isContainerAccess';
import { getContextNameFromContainerCall } from './getContextNameFromContainerCall';
import { CONTEXT_POOL_POSTFIX } from '../../build-context/transformers/addContextPool';
import { validContainerKeys } from './validContainerKeys';
import { GLOBAL_CONTEXT_NAME } from '../../context/constants';
import { ContextNamesRepository } from '../../context/ContextNamesRepository';
import { registerAllContextNames } from '../../context/registerContextNames';
import { removeExtensionFromPath } from '../../utils/removeExtensionFromPath';
import { IncorrectContainerAccessError } from '../../../compilation-context/messages/errors/IncorrectContainerAccessError';
import { ContextNotFoundError } from '../../../compilation-context/messages/errors/ContextNotFoundError';
import { CompilationContext } from '../../../compilation-context/CompilationContext';

export const replaceContainerCall = (
    compilationContext: CompilationContext,
    node: IContainerAccessNode,
    factoryImportsToAdd: ts.ImportDeclaration[]
): ts.Node => {
    compilationContext.clearMessagesByFilePath(node.getSourceFile().fileName);

    if (!validContainerKeys.includes(node.expression.name.getText())) {
        compilationContext.report(new IncorrectContainerAccessError(
            `Container has only following methods: ${validContainerKeys.join(', ')}`,
            node,
            null,
        ));

        return node;
    }

    const contextName = getContextNameFromContainerCall(compilationContext, node);

    if (contextName === null) {
        return node;
    }

    if (contextName === GLOBAL_CONTEXT_NAME) {
        compilationContext.report(new IncorrectContainerAccessError(
            'You can not access Global context',
            node,
            null,
        ));

        return node;
    }

    let contextPath: string | null = ContextNamesRepository.nameToPath.get(contextName) ?? null;

    if (contextPath === null) {
        registerAllContextNames(compilationContext);

        contextPath = ContextNamesRepository.nameToPath.get(contextName) ?? null;

        if (contextPath === null) {
            compilationContext.report(new ContextNotFoundError(
                null,
                node,
                null,
            ));

            return node;
        }
    }

    // TODO check interfaces
    // checkBeansInterface(node, contextDescriptor);

    const contextPathWithoutExt = removeExtensionFromPath(upath.normalize(contextPath));

    const importPath = `./${upath.relative(
        upath.dirname(node.getSourceFile().fileName),
        contextPathWithoutExt,
    )}`;
    const importNamespaceName = `${contextName}${CONTEXT_POOL_POSTFIX}`;
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
