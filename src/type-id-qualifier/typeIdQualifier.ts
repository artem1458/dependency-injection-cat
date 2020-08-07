import * as ts from 'typescript';
import { TypeQualifierError } from './TypeQualifierError';
import { isHasTypeNode } from '../utils/isHasTypeNode';

export function typeIdQualifier(typeChecker: ts.TypeChecker, node: ts.Node): string {
    if (!isHasTypeNode(node) || node.type === undefined) {
        throw new Error(TypeQualifierError.HasNoType);
    }

    if (!ts.isTypeReferenceNode(node.type)) {
        throw new Error(TypeQualifierError.TypeIsPrimitive);
    }

    if (node.type.typeName === undefined) {
        throw new Error('No typeName found');
    }

    getNodesWith(node, node.type.typeName);

    const typeSymbol = typeChecker.getTypeFromTypeNode(node.type.typeName).symbol;
    const fullyQualifiedName = typeChecker.getFullyQualifiedName(typeSymbol); //TODO How to Resolve complex types

    return fullyQualifiedName;
}

function getNodesWith(originalNode: ts.Node, typeName: ts.EntityName): ts.Node[] {
    const nodesList: ts.Node[] = [];

    ts.forEachChild(typeName.getSourceFile(), node => {
        if (node === originalNode) {
            return;
        }

        if (ts.isImportDeclaration(node) && node.importClause !== undefined && node.importClause.namedBindings !== undefined) {
            node.importClause.namedBindings
        }
    });
}
