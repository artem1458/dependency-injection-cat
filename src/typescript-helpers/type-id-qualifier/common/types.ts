import {
    NodeArray,
    TypeNode,
    TypeReferenceNode,
    PropertyDeclaration,
    CallExpression,
} from 'typescript';

export interface ITypeReferenceNode extends TypeReferenceNode {
    typeArguments: NodeArray<TypeNode>;
}

export interface ITypeIdQualifierResult {
    originalTypeName: string;
    typeId: string;
}

export interface IClassPropertyDeclarationWithInitializer extends PropertyDeclaration {
    initializer: CallExpression;
}
