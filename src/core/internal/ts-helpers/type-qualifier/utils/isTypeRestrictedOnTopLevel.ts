import { Node } from 'typescript';
import { typeKeywords } from '../constants';

export function isTypeRestrictedOnTopLevel(node: Node): boolean {
    return typeKeywords.includes(node.kind);
}
