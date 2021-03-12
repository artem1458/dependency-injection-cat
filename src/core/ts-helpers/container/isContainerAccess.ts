import ts from 'typescript';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';
import { libraryName } from '../../../constants/libraryName';

export interface IContainerAccessNode extends ts.CallExpression {
    expression: ts.PropertyAccessExpression & { expression: ts.Identifier }
}

export const isContainerAccess = (node: ts.Node): node is IContainerAccessNode => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.expression)) {
        const nodeDescriptor = getNodeSourceDescriptorDeep(node.getSourceFile(), node.expression.expression.getText());

        if (nodeDescriptor === null) {
            return false;
        }

        return nodeDescriptor.path === libraryName
            && nodeDescriptor.name === 'container';
    }

    return false;
};
