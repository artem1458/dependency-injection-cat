import ts from 'typescript';

export enum QualifiedTypeEnum {
    PLAIN = 'PLAIN',
    LIST = 'LIST',
}

export interface IQualifiedTypeV2 {
    typeString: string;
    typeIds: Set<string>;
}

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
* TypeLiteralNode - {} with some members
* LiteralTypeNode - '' | NullLiteral | BooleanLiteral | LiteralExpression | PrefixUnaryExpression
*
*
* TypeReferenceNode
* ArrayTypeNode
* TupleTypeNode
* UnionTypeNode - Should we allow it?
* ParenthesizedTypeNode
* */

export class TypeQualifier {

    static qualify(typeNode: ts.TypeNode): IQualifiedTypeV2 | null {
        const qualifiedType: IQualifiedTypeV2 = {
            typeIds: new Set(),
            typeString: typeNode.getText(),
        };

        if (ts.isIntersectionTypeNode(typeNode)) {
            typeNode.types;
        }

        return null;
    }
    //
    // private getTypeId(typeNode: ts.TypeNode): string {
    //
    // }
    //
    // private isListTypeNode(typeNode: ts.TypeNode): boolean {
    //
    // }
}
