import { TypeChecker, Node, isTypeReferenceNode } from 'typescript';
import { TypeQualifierError } from './TypeQualifierError';
import { isHasTypeNode } from '../utils/isHasTypeNode';

export function typeIdQualifier(typeChecker: TypeChecker, node: Node): string {
    if (!isHasTypeNode(node) || node.type === undefined) {
        throw new Error(TypeQualifierError.HasNoType);
    }

    if (!isTypeReferenceNode(node.type)) {
        throw new Error(TypeQualifierError.TypeIsPrimitive);
    }

    const typeSymbol = typeChecker.getTypeFromTypeNode(node.type).symbol;
    const fullyQualifiedName = typeChecker.getFullyQualifiedName(typeSymbol); //TODO How to Resolve complex types

    return fullyQualifiedName;
}
