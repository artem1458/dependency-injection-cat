import ts from 'typescript';
import { NamedClassDeclaration } from '../types';

export const isNamedClassDeclaration = (node: ts.ClassDeclaration): node is NamedClassDeclaration => {
    return node.name !== undefined;
};
