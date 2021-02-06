import { CallExpression, NodeArray, PropertyDeclaration, TypeNode, TypeReferenceNode, } from 'typescript';

export interface ITypeReferenceNode extends TypeReferenceNode {
    typeArguments: NodeArray<TypeNode>;
}

export interface IQualifiedType {
    originalTypeName: string;
    typeId: string;
}

export interface IClassPropertyDeclarationWithInitializer extends PropertyDeclaration {
    initializer: CallExpression;
}
