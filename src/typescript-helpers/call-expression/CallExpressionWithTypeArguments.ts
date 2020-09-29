import * as ts from 'typescript';

export interface CallExpressionWithTypeArguments extends ts.CallExpression {
    typeArguments: ts.NodeArray<ts.TypeNode>;
}
