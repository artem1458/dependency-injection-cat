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

export function isNamespaceImportDeclaration(node: ts.Statement): node is NamespaceImportDeclaration {
    return ts.isImportDeclaration(node)
        && node.importClause !== undefined
        && node.importClause.namedBindings !== undefined
        && ts.isNamespaceImport(node.importClause.namedBindings);
}

export function isNamedImports(node: ts.Statement): node is NamedImportsDeclaration {
    return ts.isImportDeclaration(node)
        && node.importClause !== undefined
        && node.importClause.namedBindings !== undefined
        && ts.isNamedImports(node.importClause.namedBindings);
}
