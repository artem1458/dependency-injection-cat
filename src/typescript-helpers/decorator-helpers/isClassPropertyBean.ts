import * as ts from 'typescript';
import { IClassPropertyDeclarationWithInitializer } from '../type-id-qualifier/common/types';
import { libraryName } from '../../constants/libraryName';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';

export function isClassPropertyBean(node: ts.Node): node is IClassPropertyDeclarationWithInitializer {
    return ts.isPropertyDeclaration(node) && hasBeanCallExpression(node);
}

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

    return nodeSourceDescriptor.name === 'Bean' && nodeSourceDescriptor.path === libraryName;
}
