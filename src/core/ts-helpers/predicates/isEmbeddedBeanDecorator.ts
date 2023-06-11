import * as ts from 'typescript';
import { CONSTANTS } from '../../../constants';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';

export function isEmbeddedBeanDecorator(decorator: ts.Decorator): boolean {
    let nameToFind: string | undefined = undefined;

    const expression = decorator.expression;

    if (ts.isIdentifier(expression) || ts.isPropertyAccessExpression(expression)) {
        nameToFind = expression.getText();
    }

    if (nameToFind === undefined) {
        return false;
    }

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(decorator.getSourceFile(), nameToFind);

    if (nodeSourceDescriptor === null) {
        return false;
    }

    return nodeSourceDescriptor.name === 'EmbeddedBean' && nodeSourceDescriptor.path === CONSTANTS.libraryName;
}
