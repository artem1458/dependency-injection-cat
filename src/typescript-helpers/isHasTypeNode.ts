import { HasType, Node } from 'typescript';
import { get } from 'lodash';

export function isHasTypeNode(node: Node): node is HasType {
    return Boolean(get(node, 'type'));
}
