import * as ts from 'typescript';
import { TypeQualifierError } from './TypeQualifierError';
import { isTypeRestrictedOnTopLevel } from './utils/isTypeRestrictedOnTopLevel';
import { isTypeReferenceNode } from './utils/isTypeReferenceNode';
import { typeIdQualifierBase } from './typeIdQualifierBase';
import { typeKeywords, typeKeywordsDictionary } from './constants';
import {
    ARRAY_TYPE_TOKEN,
    CLOSE_TYPE_ARGUMENTS_TOKEN,
    OPEN_TYPE_ARGUMENTS_TOKEN,
    TUPLE_TYPE_TOKEN,
    UNION_TYPE_TOKEN
} from './parseTokens';
import { ITypeIdQualifierResult } from './types';

export function typeIdQualifier(typeNode: ts.TypeNode): ITypeIdQualifierResult {
    return {
        originalTypeName: typeNode.getText(),
        typeId: getTypesNameDeep(typeNode),
    };
}

function getTypesNameDeep(node: ts.Node, prevType = '', deepness = 0): string {
    if (deepness === 0 && typeKeywords.includes(node.kind)) {
        throw new Error(TypeQualifierError.TypeIsPrimitive);
    }

    if (typeKeywords.includes(node.kind)) {
        return typeKeywordsDictionary[node.kind];
    }

    if (ts.isArrayTypeNode(node)) {
        const nodeName = getTypesNameDeep(node.elementType, prevType, deepness);

        return `${nodeName}${ARRAY_TYPE_TOKEN}`;
    }

    if (ts.isUnionTypeNode(node)) {
        if (deepness === 0 && node.types.every(isTypeRestrictedOnTopLevel)) {
            throw new Error(TypeQualifierError.TypeIsPrimitive);
        }

        const types = node.types.map(it => getTypesNameDeep(it, prevType, deepness));

        return types.join(UNION_TYPE_TOKEN);
    }

    if (!ts.isIntersectionTypeNode(node) && deepness === 0 && isTypeRestrictedOnTopLevel(node)) {
        throw new Error(TypeQualifierError.TypeIsPrimitive);
    }

    if (ts.isIntersectionTypeNode(node)) {
        if (deepness === 0 && node.types.every(isTypeRestrictedOnTopLevel)) {
            throw new Error(TypeQualifierError.TypeIsPrimitive);
        }

        const types = node.types.map(it => {
            return getTypesNameDeep(it, prevType, deepness);
        });

        return types.join(TUPLE_TYPE_TOKEN);
    }

    if (isTypeReferenceNode(node)) {
        const types = node.typeArguments.map(it => getTypesNameDeep(it, prevType, deepness + 1));
        const nodeName = typeIdQualifierBase(node);

        return `${nodeName}${OPEN_TYPE_ARGUMENTS_TOKEN}${types.join(', ')}${CLOSE_TYPE_ARGUMENTS_TOKEN}`;
    }

    return typeIdQualifierBase(node as ts.TypeReferenceNode);
}
