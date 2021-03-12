import * as ts from 'typescript';

export interface NamespaceImportDeclaration extends ts.ImportDeclaration {
    importClause: ts.ImportClause & {
        namedBindings: ts.NamespaceImport;
    };
}

export interface NamedImportsDeclaration extends ts.ImportDeclaration {
    importClause: ts.ImportClause & {
        namedBindings: ts.NamedImports;
    };
}

export const isNamespaceImportDeclaration = (node: ts.Statement): node is NamespaceImportDeclaration =>
    ts.isImportDeclaration(node)
    && node.importClause !== undefined
    && node.importClause.namedBindings !== undefined
    && ts.isNamespaceImport(node.importClause.namedBindings);

export const isNamedImports = (node: ts.Statement): node is NamedImportsDeclaration =>
    ts.isImportDeclaration(node)
    && node.importClause !== undefined
    && node.importClause.namedBindings !== undefined
    && ts.isNamedImports(node.importClause.namedBindings);
