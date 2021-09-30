import ts, { factory, KeywordTypeNode, SyntaxKind } from 'typescript';
import { QualifiedType, QualifiedTypeEnum } from './QualifiedType';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { ExtendedSet } from '../../utils/ExtendedSet';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';

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
* */

/* TypeNodes that is allowed
* TypeLiteralNode - {} with some members. Should allow it?
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

export class TypeQualifier {

    //TODO Add related context to errors
    static qualify(node: ts.TypeNode): QualifiedType | null {
        const typeNode = this.removeParenthesizingFromTypeNode(node);

        const qualifiedType = new QualifiedType();

        let qualifiedTypes: string[] | null;

        if (ts.isArrayTypeNode(typeNode)) {
            qualifiedType.kind = QualifiedTypeEnum.LIST;
            qualifiedTypes = this._qualify(typeNode.elementType);
        } else {
            qualifiedTypes = this._qualify(typeNode);
        }

        if (ts.isIntersectionTypeNode(typeNode)) {
            const qualifiedNullableTypes = typeNode.types.map(it => this._qualify(it)).flat();

            if (qualifiedNullableTypes.includes(null)) {
                CompilationContext.reportError({
                    message: 'Can not qualify intersection type',
                    node: typeNode,
                    filePath: typeNode.getSourceFile().fileName,
                });

                return null;
            }

            const nonNullableQualifiedTypes = this.filterNotNull(qualifiedNullableTypes).sort();

            qualifiedTypes = this.generateAllIntersectionCombinations(nonNullableQualifiedTypes);
        }

        if (qualifiedTypes === null) {
            return null;
        }

        qualifiedType.typeIds = new ExtendedSet<string>(qualifiedTypes);
        qualifiedType.typeNode = typeNode;

        return qualifiedType;
    }

    private static _qualify(typeNode: ts.TypeNode): string[] | null {
        if (ts.isParenthesizedTypeNode(typeNode)) {
            CompilationContext.reportError({
                message: 'Parenthesizing of types allowed only on top level of type',
                node: typeNode,
                filePath: typeNode.getSourceFile().fileName,
            });

            return null;
        }

        if (ts.isLiteralTypeNode(typeNode)) {
            const literalTypeId = this.getLiteralTypeId(typeNode);

            if (literalTypeId !== null) {
                return [literalTypeId];
            } else {
                CompilationContext.reportError({
                    message: 'Can not qualify literal type',
                    node: typeNode,
                    filePath: typeNode.getSourceFile().fileName,
                });

                return null;
            }
        }

        if (this.isKeywordTypeNode(typeNode)) {
            const keywordTypeId = this.getKeywordTypeId(typeNode);

            if (keywordTypeId !== null) {
                return [keywordTypeId];
            } else {
                CompilationContext.reportError({
                    message: 'Can not qualify keyword type',
                    node: typeNode,
                    filePath: typeNode.getSourceFile().fileName,
                });

                return null;
            }
        }

        if (ts.isIntersectionTypeNode(typeNode)) {
            const qualifiedNullableTypes = typeNode.types.map(it => this._qualify(it)).flat();

            if (qualifiedNullableTypes.includes(null)) {
                CompilationContext.reportError({
                    message: 'Can not qualify intersection type',
                    node: typeNode,
                    filePath: typeNode.getSourceFile().fileName,
                });

                return null;
            }

            return [this.filterNotNull(qualifiedNullableTypes).sort().join(' &intersection& ')];
        }

        if (ts.isTypeReferenceNode(typeNode)) {
            const nodeSourceDescriptor = getNodeSourceDescriptorDeep(
                typeNode.getSourceFile(),
                typeNode.typeName.getText(),
            );

            if (nodeSourceDescriptor === null) {
                CompilationContext.reportError({
                    message: 'Can not qualify type reference',
                    node: typeNode,
                    filePath: typeNode.getSourceFile().fileName,
                });
                return null;
            }

            const typeReferenceFullName = `${nodeSourceDescriptor.name}${nodeSourceDescriptor.path}`;

            const typeArguments = typeNode.typeArguments ?? factory.createNodeArray();
            const nullableQualifiedTypeArguments = typeArguments.map(it => this._qualify(it));

            if (nullableQualifiedTypeArguments.includes(null)) {
                CompilationContext.reportError({
                    message: 'Can not qualify type reference',
                    node: typeNode,
                    filePath: typeNode.getSourceFile().fileName,
                });
                return null;
            }

            const qualifiedTypes = this.filterNotNull(nullableQualifiedTypeArguments).map(it => it.join(''));

            return [`${typeReferenceFullName}<${qualifiedTypes.join(', ')}>`];
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
}
