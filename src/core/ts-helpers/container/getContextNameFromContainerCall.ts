import ts from 'typescript';
import { IContainerAccessNode } from './isContainerAccess';
import { unquoteString } from '../../utils/unquoteString';
import { IncorrectContainerAccessError } from '../../../compilation-context/messages/errors/IncorrectContainerAccessError';
import { CompilationContext } from '../../../compilation-context/CompilationContext';

type TContextName = string;

export const getContextNameFromContainerCall = (
    compilationContext: CompilationContext,
    node: IContainerAccessNode
): TContextName | null => {
    const firstArg: ts.Node | null = node.arguments[0] ?? null;

    if (firstArg && !ts.isObjectLiteralExpression(firstArg)) {
        compilationContext.report(new IncorrectContainerAccessError(
            'First argument in container access call should be an object literal.',
            node,
            null,
        ));
        return null;
    }

    const contextNameProperty = firstArg.properties
        .filter(ts.isPropertyAssignment)
        .find(it => it.name?.getText() === 'name') ?? null;

    if (contextNameProperty === null) {
        compilationContext.report(new IncorrectContainerAccessError(
            'You should pass "name" property to the container access props.',
            node,
            null,
        ));

        return null;
    }

    if (!ts.isStringLiteral(contextNameProperty.initializer)) {
        compilationContext.report(new IncorrectContainerAccessError(
            'Property "name" in container access props should be a string literal.',
            node,
            null,
        ));

        return null;
    }

    return unquoteString(contextNameProperty.initializer.getText());
};
