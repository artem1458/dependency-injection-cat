import * as ts from 'typescript';
import { removeExtensionFromPath } from '../utils/removeExtensionFromPath';

export function isCallExpressionFromFile(typeChecker: ts.TypeChecker, node: ts.CallLikeExpression, fileName: string): boolean {
    const resolved = typeChecker.getResolvedSignature(node);

    if (resolved === undefined || resolved.declaration === undefined) {
        return false;
    }

    const callExpressionFileName = resolved.declaration.getSourceFile().fileName;

    return removeExtensionFromPath(fileName) === removeExtensionFromPath(callExpressionFileName);
}
