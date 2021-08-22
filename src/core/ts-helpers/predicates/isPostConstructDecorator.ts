import * as ts from 'typescript';
import { libraryName } from '../../../constants/libraryName';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';

export function isPostConstructDecorator(decorator: ts.Decorator): boolean {
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

    return nodeSourceDescriptor.name === 'PostConstruct' && nodeSourceDescriptor.path === libraryName;
}
