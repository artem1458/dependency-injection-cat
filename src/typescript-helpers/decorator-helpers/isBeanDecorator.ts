import * as ts from 'typescript';
import { libraryName } from '../../constants/libraryName';
import { getNodeSourceDescriptorDeep } from '../../core/internal/ts-helpers/node-source-descriptor';

export function isBeanDecorator(decorator: ts.Decorator): boolean {
    let nameToFind: string | undefined = undefined;

    const expression = decorator.expression;

    if (ts.isCallExpression(expression)) {
        nameToFind = expression.expression.getText();
    }

    if (ts.isIdentifier(expression)) {
        nameToFind = expression.getText();
    }

    if (nameToFind === undefined) {
        return false;
    }

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(decorator.getSourceFile(), nameToFind);

    if (nodeSourceDescriptor === null) {
        return false;
    }

    return nodeSourceDescriptor.name === 'Bean' && nodeSourceDescriptor.path === libraryName;
}
