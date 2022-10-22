import ts, { factory, KeywordTypeNode, SyntaxKind } from 'typescript';
import { QualifiedType, QualifiedTypeKind } from './QualifiedType';
import { ExtendedSet } from '../../utils/ExtendedSet';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { IContextDescriptor } from '../../context/ContextRepository';
import { TypeQualifyError } from '../../../compilation-context/messages/errors/TypeQualifyError';

/* TypeNodes that is not allowed
* FunctionTypeNode
* ConstructorTypeNode
* TypePredicateNode
* TypeQueryNode
* OptionalTypeNode
* RestTypeNode
* ConditionalTypeNode
* ThisTypeNode
* TypeOperatorNode
* IndexedAccessTypeNode
* MappedTypeNode
* ImportTypeNode
* TemplateLiteralTypeSpan
* TemplateLiteralTypeNode
* InferTypeNode - method<T>(): T
* TypeLiteralNode - {} with some members. Should allow it?
* */

/* TypeNodes that is allowed
* UnionTypeNode - Should allow it?  // A | B | C
*
* DONE - LiteralTypeNode - '' | NullLiteral | BooleanLiteral | LiteralExpression | PrefixUnaryExpression
*
*
* DONE - ArrayTypeNode
* DONE - TypeReferenceNode
* DONE - IntersectionTypeNode
* TupleTypeNode - Don't need??
* DONE Only on top-level of type - ParenthesizedTypeNode
* */

const KEYWORD_TYPES = [
    SyntaxKind.AnyKeyword,
    SyntaxKind.BigIntKeyword,
    SyntaxKind.BooleanKeyword,
    SyntaxKind.IntrinsicKeyword,
    SyntaxKind.NeverKeyword,
    SyntaxKind.NumberKeyword,
    SyntaxKind.ObjectKeyword,
    SyntaxKind.StringKeyword,
    SyntaxKind.SymbolKeyword,
    SyntaxKind.UndefinedKeyword,
    SyntaxKind.UnknownKeyword,
    SyntaxKind.VoidKeyword
];

interface IQualifiedTypes {
    types: string[];
    fullTypeId: string;
}

export class TypeQualifier {

    static qualify(
        compilationContext: CompilationContext,
        contextDescriptor: IContextDescriptor,
        node: ts.TypeNode
    ): QualifiedType | null {
        const typeNode = this.removeParenthesizingFromTypeNode(node);

        const qualifiedType = new QualifiedType();

        let qualifiedTypes: IQualifiedTypes | null;

        if (ts.isArrayTypeNode(typeNode)) {
            qualifiedType.kind = QualifiedTypeKind.LIST;
            qualifiedTypes = this._qualify(compilationContext, contextDescriptor,typeNode.elementType);
        } else {
            qualifiedTypes = this._qualify(compilationContext, contextDescriptor, typeNode);
        }

        if (ts.isIntersectionTypeNode(typeNode)) {
            const qualifiedNullableTypes = typeNode.types.map(it => this._qualify(compilationContext, contextDescriptor, it)).flat();

            if (qualifiedNullableTypes.includes(null)) {
                compilationContext.report(new TypeQualifyError(
                    'Intersection types is not supported.',
                    typeNode,
                    contextDescriptor.node,
                ));
                return null;
            }

            const nonNullableQualifiedTypes = this.filterNotNull(qualifiedNullableTypes).map(it => it.types).sort();

            const qualifiedTypeCombinations = this.generateAllIntersectionCombinations(nonNullableQualifiedTypes.flat());
            const fullTypeId = this.getLongestStringFromList(qualifiedTypeCombinations);

            qualifiedTypes = {
                types: qualifiedTypeCombinations,
                fullTypeId: fullTypeId,
            };
        }

        if (qualifiedTypes === null) {
            return null;
        }

        qualifiedType.typeIds = new ExtendedSet<string>(qualifiedTypes.types);
        qualifiedType.fullTypeId = qualifiedTypes.fullTypeId;
        qualifiedType.typeNode = typeNode;

        return qualifiedType;
    }

    private static _qualify(
        compilationContext: CompilationContext,
        contextDescriptor: IContextDescriptor,
        typeNode: ts.TypeNode
    ): IQualifiedTypes | null {
        if (ts.isParenthesizedTypeNode(typeNode)) {
            compilationContext.report(new TypeQualifyError(
                'Parenthesizing in types is not allowed in nested types.',
                typeNode,
                contextDescriptor.node,
            ));

            return null;
        }

        if (ts.isLiteralTypeNode(typeNode)) {
            const literalTypeId = this.getLiteralTypeId(typeNode);

            if (literalTypeId !== null) {
                return {
                    fullTypeId: literalTypeId,
                    types: [literalTypeId],
                };
            } else {
                compilationContext.report(new TypeQualifyError(
                    'Can not qualify literal type.',
                    typeNode,
                    contextDescriptor.node,
                ));
                return null;
            }
        }

        if (this.isKeywordTypeNode(typeNode)) {
            const keywordTypeId = this.getKeywordTypeId(typeNode);

            if (keywordTypeId !== null) {
                return {
                    fullTypeId: keywordTypeId,
                    types: [keywordTypeId]
                };
            } else {
                compilationContext.report(new TypeQualifyError(
                    'Can not qualify keyword type.',
                    typeNode,
                    contextDescriptor.node,
                ));
                return null;
            }
        }

        if (ts.isUnionTypeNode(typeNode)) {
            const qualifiedNullableTypes = typeNode.types.map(it => this._qualify(compilationContext, contextDescriptor, it)).flat();

            if (qualifiedNullableTypes.includes(null)) {
                compilationContext.report(new TypeQualifyError(
                    'Can not qualify intersection type.',
                    typeNode,
                    contextDescriptor.node,
                ));
                return null;
            }

            const unionType = this.filterNotNull(qualifiedNullableTypes).map(it => it.fullTypeId).sort()
                .join('|union|');

            return {
                fullTypeId: unionType,
                types: [unionType]
            };
        }

        if (ts.isArrayTypeNode(typeNode)) {
            const qualified = this._qualify(compilationContext, contextDescriptor, typeNode.elementType);

            if (qualified === null) {
                compilationContext.report(new TypeQualifyError(
                    'Can not qualify array type.',
                    typeNode,
                    contextDescriptor.node,
                ));
                return null;
            }

            const type = `${qualified.fullTypeId}_array_type`;

            return {
                types: [type],
                fullTypeId: type
            };
        }

        if (ts.isIntersectionTypeNode(typeNode)) {
            const qualifiedNullableTypes = typeNode.types.map(it => this._qualify(compilationContext, contextDescriptor, it)).flat();

            if (qualifiedNullableTypes.includes(null)) {
                compilationContext.report(new TypeQualifyError(
                    'Can not qualify intersection type.',
                    typeNode,
                    contextDescriptor.node,
                ));
                return null;
            }

            const intersectionType = this.filterNotNull(qualifiedNullableTypes).map(it => it.fullTypeId)
                .sort().join(' &intersection& ');

            return {
                fullTypeId: intersectionType,
                types: [intersectionType],
            };
        }

        if (ts.isTypeReferenceNode(typeNode)) {
            const nodeSourceDescriptor = getNodeSourceDescriptorDeep(
                typeNode.getSourceFile(),
                typeNode.typeName.getText(),
            );
            if (nodeSourceDescriptor === null) {
                compilationContext.report(new TypeQualifyError(
                    'Can not qualify type reference.',
                    typeNode,
                    contextDescriptor.node,
                ));
                return null;
            }

            const typeReferenceFullName = `${nodeSourceDescriptor.name}${nodeSourceDescriptor.path}`;

            const typeArguments = typeNode.typeArguments ?? factory.createNodeArray();
            const nullableQualifiedTypeArguments = typeArguments.map(it => this._qualify(compilationContext, contextDescriptor, it));

            if (nullableQualifiedTypeArguments.includes(null)) {
                compilationContext.report(new TypeQualifyError(
                    'Can not qualify type reference.',
                    typeNode,
                    contextDescriptor.node,
                ));
                return null;
            }

            const qualifiedTypeArgumentTypes = this.filterNotNull(nullableQualifiedTypeArguments).map(it => it.fullTypeId);
            const qualifiedType = qualifiedTypeArgumentTypes.length === 0
                ? typeReferenceFullName
                : `${typeReferenceFullName}<${qualifiedTypeArgumentTypes.join(', ')}>`;

            return {
                fullTypeId: qualifiedType,
                types: [qualifiedType],
            };
        }

        return null;
    }

    private static getLiteralTypeId(literalTypeNode: ts.LiteralTypeNode): string | null {
        switch (literalTypeNode.literal.kind) {
        case SyntaxKind.NullKeyword:
            return 'null_literal';
        case SyntaxKind.TrueKeyword:
            return 'true_literal';
        case SyntaxKind.FalseKeyword:
            return 'false_literal';
        case SyntaxKind.BigIntLiteral:
            return `${literalTypeNode.literal.text}_bigint_literal`;
        case SyntaxKind.StringLiteral:
            return `${literalTypeNode.literal.text}_string_literal`;
        case SyntaxKind.NumericLiteral:
            return `${literalTypeNode.literal.text}_numeric_literal`;
        default:
            return null;
        }
    }

    private static getKeywordTypeId(typeNode: KeywordTypeNode): string | null {
        switch (typeNode.kind) {
        case SyntaxKind.AnyKeyword:
            return 'any_keyword';
        case SyntaxKind.BigIntKeyword:
            return 'bigint_keyword';
        case SyntaxKind.BooleanKeyword:
            return 'boolean_keyword';
        case SyntaxKind.IntrinsicKeyword:
            return 'intrinsic_keyword';
        case SyntaxKind.NeverKeyword:
            return 'never_keyword';
        case SyntaxKind.NumberKeyword:
            return 'number_keyword';
        case SyntaxKind.ObjectKeyword:
            return 'object_keyword';
        case SyntaxKind.StringKeyword:
            return 'string_keyword';
        case SyntaxKind.SymbolKeyword:
            return 'symbol_keyword';
        case SyntaxKind.UndefinedKeyword:
            return 'undefined_keyword';
        case SyntaxKind.UnknownKeyword:
            return 'unknown_keyword';
        case SyntaxKind.VoidKeyword:
            return 'void_keyword';
        default:
            return null;
        }
    }

    private static removeParenthesizingFromTypeNode(node: ts.TypeNode): ts.TypeNode {
        return ts.isParenthesizedTypeNode(node) ? node.type : node;
    }

    private static isKeywordTypeNode(node: ts.TypeNode): node is ts.KeywordTypeNode {
        return KEYWORD_TYPES.includes(node.kind);
    }

    private static filterNotNull<T>(list: Array<T | null>): Array<T> {
        return list.filter((it): it is T => it !== null);
    }

    private static generateAllIntersectionCombinations(list: string[]): string[] {
        const result: string[] = [];

        const combine = (list: string[], prefix: string = ''): void => {
            for (let i = 0; i < list.length; i++) {
                const combined = prefix === '' ? list[i] : `${prefix} &intersection& ${list[i]}`;

                result.push(combined);
                combine(list.slice(i + 1), combined);
            }
        };

        combine(list);

        return result;
    }

    private static getLongestStringFromList(list: string[]): string {
        return list.sort((a, b) => b.length - a.length)[0];
    }
}
