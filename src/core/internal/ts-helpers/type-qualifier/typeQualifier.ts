import * as ts from 'typescript';
import { isTypeRestrictedOnTopLevel } from './utils/isTypeRestrictedOnTopLevel';
import { isTypeReferenceNode } from './utils/isTypeReferenceNode';
import { typeQualifierBase } from './typeQualifierBase';
import { typeKeywords, typeKeywordsDictionary } from './constants';
import {
    ARRAY_TYPE_TOKEN,
    CLOSE_TYPE_ARGUMENTS_TOKEN,
    OPEN_TYPE_ARGUMENTS_TOKEN,
    TUPLE_TYPE_TOKEN,
    UNION_TYPE_TOKEN
} from './parseTokens';
import { IQualifiedType } from './types';
import { CompilationContext } from '../../../compilation-context/CompilationContext';

export function typeQualifier(typeNode: ts.TypeNode): IQualifiedType {
    return {
        originalTypeName: typeNode.getText(),
        typeId: getTypesNameDeep(typeNode),
    };
}

function getTypesNameDeep(node: ts.Node, prevType = '', deepness = 0): string {
    if (deepness === 0 && typeKeywords.includes(node.kind)) {
        CompilationContext.reportAndThrowError({
            node: node,
            message: 'Primitive types is not allowed as Bean types',
        });
    }

    if (typeKeywords.includes(node.kind)) {
        return typeKeywordsDictionary[node.kind];
    }

    //TODO get beans with array type automatically
    if (ts.isArrayTypeNode(node)) {
        const nodeName = getTypesNameDeep(node.elementType, prevType, deepness);

        return `${nodeName}${ARRAY_TYPE_TOKEN}`;
    }

    if (ts.isUnionTypeNode(node)) {
        if (deepness === 0 && node.types.every(isTypeRestrictedOnTopLevel)) {
            CompilationContext.reportAndThrowError({
                node: node,
                message: 'Primitive union types is not allowed as Bean types',
            });
        }

        const types = node.types.map(it => getTypesNameDeep(it, prevType, deepness));

        return types.join(UNION_TYPE_TOKEN);
    }

    if (!ts.isIntersectionTypeNode(node) && deepness === 0 && isTypeRestrictedOnTopLevel(node)) {
        CompilationContext.reportAndThrowError({
            node: node,
            message: 'Primitive types is not allowed as Bean types',
        });
    }

    if (ts.isIntersectionTypeNode(node)) {
        if (deepness === 0 && node.types.every(isTypeRestrictedOnTopLevel)) {
            CompilationContext.reportAndThrowError({
                node: node,
                message: 'Primitive types is not allowed as Bean types',
            });
        }

        const types = node.types.map(it => {
            return getTypesNameDeep(it, prevType, deepness);
        });

        return types.join(TUPLE_TYPE_TOKEN);
    }

    if (isTypeReferenceNode(node)) {
        const types = node.typeArguments.map(it => getTypesNameDeep(it, prevType, deepness + 1));
        const nodeName = typeQualifierBase(node);

        return `${nodeName}${OPEN_TYPE_ARGUMENTS_TOKEN}${types.join(', ')}${CLOSE_TYPE_ARGUMENTS_TOKEN}`;
    }

    return typeQualifierBase(node as ts.TypeReferenceNode);
}
