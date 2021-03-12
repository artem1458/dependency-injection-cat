import * as ts from 'typescript';
import { libraryName } from '../../../constants/libraryName';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';

export function isParameterQualifierDecorator(decoratorNode: ts.Decorator): boolean {
    const decoratorExpression = decoratorNode.expression;

    if (ts.isIdentifier(decoratorExpression)) {
        const nameToFind = decoratorExpression.getText();

        return isQualifier(decoratorNode.getSourceFile(), nameToFind);
    }

    if (ts.isCallExpression(decoratorExpression)) {
        const nameToFind = decoratorExpression.expression.getText();

        return isQualifier(decoratorNode.getSourceFile(), nameToFind);
    }

    return false;
}

function isQualifier(sourceFile: ts.SourceFile, nameToFind: string): boolean {
    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(sourceFile, nameToFind);

    if (nodeSourceDescriptor === null) {
        return false;
    }

    return nodeSourceDescriptor.name === 'Qualifier' && nodeSourceDescriptor.path === libraryName;
}
