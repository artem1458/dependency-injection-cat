import * as ts from 'typescript';
import { CallExpressionWithTypeArguments } from './CallExpressionWithTypeArguments';

export function isCallExpressionWithTypeArguments(node: ts.Node): node is CallExpressionWithTypeArguments {
    return ts.isCallExpression(node) && node.typeArguments !== undefined;
}
