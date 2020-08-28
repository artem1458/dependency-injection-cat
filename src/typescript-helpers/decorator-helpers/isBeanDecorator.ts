import * as ts from 'typescript';
import { getNodeSourceDescriptorFromImports } from '../node-source-descriptor';
import { libraryName } from '../../constants/libraryName';
import { getMethodBeanInfo } from '../bean-info/getMethodBeanInfo';

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

    const sourceDescriptor = getNodeSourceDescriptorFromImports(decorator.getSourceFile(), nameToFind);

    if (sourceDescriptor === undefined) {
        return false;
    }

    if (sourceDescriptor.name === 'Bean' && sourceDescriptor.path === libraryName) {
        const aaa = getMethodBeanInfo(decorator);
    }

    return sourceDescriptor.name === 'Bean' && sourceDescriptor.path === libraryName;
}
