import ts from 'typescript';
import { IContainerAccessNode } from './isContainerAccess';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { removeQuotesFromString } from '../../utils/removeQuotesFromString';

type TContextName = string;

export const getContextNameFromContainerCall = (node: IContainerAccessNode): TContextName | null => {
    const firstArg: ts.Node | null = node.arguments[0] ?? null;

    if (firstArg && !ts.isObjectLiteralExpression(firstArg)) {
        CompilationContext.reportError({
            node: node,
            message: 'First argument in container access should be an object literal',
            filePath: node.getSourceFile().fileName,
        });

        return null;
    }

    const contextNameProperty = firstArg.properties
        .filter(ts.isPropertyAssignment)
        .find(it => it.name?.getText() === 'name') ?? null;

    if (contextNameProperty === null) {
        CompilationContext.reportError({
            node,
            message: 'You should pass "name" property to the container access props',
            filePath: node.getSourceFile().fileName,
        });

        return null;
    }

    if (!ts.isStringLiteral(contextNameProperty.initializer)) {
        CompilationContext.reportError({
            node,
            message: 'Property "name" in container access props should be a string literal',
            filePath: node.getSourceFile().fileName,
        });

        return null;
    }

    return removeQuotesFromString(contextNameProperty.initializer.getText());
};
