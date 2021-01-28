import { Node } from 'typescript';
import { get } from 'lodash';
import { ITypeReferenceNode } from '../types';

export function isTypeReferenceNode(node: Node): node is ITypeReferenceNode {
    return get(node, 'typeArguments') !== undefined && get(node, 'typeName') !== undefined;
}
