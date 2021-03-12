import * as ts from 'typescript';

export interface LocalExportDeclaration extends ts.ExportDeclaration {
    exportClause: ts.NamedExportBindings;
    moduleSpecifier: undefined;
}

export function isLocalExportDeclaration(node: ts.ExportDeclaration): node is LocalExportDeclaration {
    return node.exportClause !== undefined && node.moduleSpecifier === undefined;
}
