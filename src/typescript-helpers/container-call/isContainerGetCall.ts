import * as ts from 'typescript';
import { isCallExpressionFromFile } from '../call-expression/isCallExpressionFromFile';
import { getNodeSourceDescriptorDeep } from '../../core/internal/ts-helpers/node-source-descriptor';

export function isContainerGetCall(typeChecker: ts.TypeChecker, node: ts.CallExpression): boolean {
    if (isCallExpressionFromFile(typeChecker, node, node.getSourceFile().fileName)) {
        return false;
    }

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(node.getSourceFile(), node.expression.getText());

    if (nodeSourceDescriptor === null) {
        return false;
    }

    return nodeSourceDescriptor.name === 'container.get';
}
