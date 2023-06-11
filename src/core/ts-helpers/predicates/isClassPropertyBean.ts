import * as ts from 'typescript';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';
import { CONSTANTS } from '../../../constants';
import { ClassPropertyDeclarationWithInitializer } from '../types';

export const isClassPropertyBean = (node: ts.Node): node is ClassPropertyDeclarationWithInitializer =>
    ts.isPropertyDeclaration(node) && hasBeanCallExpression(node);

function hasBeanCallExpression(node: ts.PropertyDeclaration): boolean {
    const initializer = node.initializer;

    if (initializer === undefined) {
        return false;
    }

    if (!ts.isCallExpression(initializer)) {
        return false;
    }

    const nameToFind = initializer.expression.getText();

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(node.getSourceFile(), nameToFind);

    if (nodeSourceDescriptor === null) {
        return false;
    }

    return nodeSourceDescriptor.name === 'Bean' && nodeSourceDescriptor.path === CONSTANTS.libraryName;
}
