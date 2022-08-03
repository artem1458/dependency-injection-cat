import ts from 'typescript';
import { NamedClassDeclaration } from '../types';

export const isNamedClassDeclaration = (node: ts.Node): node is NamedClassDeclaration => {
    return ts.isClassDeclaration(node) && node.name !== undefined;
};
