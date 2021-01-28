import { NodeArray, TypeNode, TypeReferenceNode, } from 'typescript';

export interface ITypeReferenceNode extends TypeReferenceNode {
    typeArguments: NodeArray<TypeNode>;
}

export interface ITypeIdQualifierResult {
    originalTypeName: string;
    typeId: string;
}

