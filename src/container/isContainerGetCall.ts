import * as ts from 'typescript';

export function isContainerGetCall(typeChecker: ts.TypeChecker, node: ts.Node): node is ts.CallExpression {
    if (ts.isCallExpression(node)) {
        const expressionText = node.expression.getText();
        const bb = typeChecker.getResolvedSignature(node); //Check for signature, and if it's not exist, check imports, if exist, check source file path, for not equality to current
        aa;
        // if (node.typeArguments === undefined) {
        //     throw new Error();
        // }
    }

    return false;
}
