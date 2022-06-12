import ts from 'typescript';
import { IContainerAccessNode } from './isContainerAccess';
import { unquoteString } from '../../utils/unquoteString';
import { TransformationContext } from '../../../compilation-context/TransformationContext';
import { IncorrectContainerAccessError } from '../../../exceptions/transformation/errors/IncorrectContainerAccessError';

type TContextName = string;

export const getContextNameFromContainerCall = (
    transformationContext: TransformationContext,
    node: IContainerAccessNode
): TContextName | null => {
    const firstArg: ts.Node | null = node.arguments[0] ?? null;

    if (firstArg && !ts.isObjectLiteralExpression(firstArg)) {
        transformationContext.report(new IncorrectContainerAccessError(
            'First argument in container access call should be an object literal.',
            node,
        ));
        return null;
    }

    const contextNameProperty = firstArg.properties
        .filter(ts.isPropertyAssignment)
        .find(it => it.name?.getText() === 'name') ?? null;

    if (contextNameProperty === null) {
        transformationContext.report(new IncorrectContainerAccessError(
            'You should pass "name" property to the container access props.',
            node,
        ));

        return null;
    }

    if (!ts.isStringLiteral(contextNameProperty.initializer)) {
        transformationContext.report(new IncorrectContainerAccessError(
            'Property "name" in container access props should be a string literal.',
            node,
        ));

        return null;
    }

    return unquoteString(contextNameProperty.initializer.getText());
};
