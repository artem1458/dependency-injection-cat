import * as ts from 'typescript';
import { libraryName } from '../../constants/libraryName';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';

export function isParameterQualifierDecorator(decoratorNode: ts.Decorator): boolean {
    const decoratorExpression = decoratorNode.expression;

    if (!ts.isCallExpression(decoratorExpression)) {
        return false;
    }

    const nameToFind = decoratorExpression.expression.getText();

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(decoratorNode.getSourceFile(), nameToFind);

    if (nodeSourceDescriptor === null) {
        return false;
    }

    return nodeSourceDescriptor.name === 'Qualifier' && nodeSourceDescriptor.path === libraryName;
}
