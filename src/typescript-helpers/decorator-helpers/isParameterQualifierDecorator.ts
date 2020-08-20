import * as ts from 'typescript';
import { getNodeSourceDescriptorFromImports } from '../node-source-descriptor';
import { libraryName } from '../../constants/libraryName';

export function isParameterQualifierDecorator(decoratorNode: ts.Decorator): boolean {
    const decoratorExpression = decoratorNode.expression;

    if (!ts.isCallExpression(decoratorExpression)) {
        return false;
    }

    const nameToFind = decoratorExpression.expression.getText();

    const sourceDescriptor = getNodeSourceDescriptorFromImports(decoratorNode.getSourceFile(), nameToFind);

    if (sourceDescriptor === undefined) {
        return false;
    }

    return sourceDescriptor.name === 'Qualifier' && sourceDescriptor.path === libraryName;
}
