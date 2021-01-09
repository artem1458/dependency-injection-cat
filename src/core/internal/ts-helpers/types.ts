import ts from 'typescript';

export interface NamedClassDeclaration extends ts.ClassDeclaration {
    name: ts.Identifier;
}
