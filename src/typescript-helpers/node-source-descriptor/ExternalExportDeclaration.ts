import * as ts from 'typescript';

export interface ExternalExportDeclaration extends ts.ExportDeclaration {
    exportClause: ts.NamedExportBindings;
    moduleSpecifier: ts.Expression;
}
export interface NamedExternalExportsDeclaration extends ts.ExportDeclaration {
    exportClause: ts.NamedExports;
    moduleSpecifier: ts.Expression;
}

export function isExternalExportDeclaration(node: ts.ExportDeclaration): node is ExternalExportDeclaration {
    return node.exportClause !== undefined && node.moduleSpecifier !== undefined;
}

export function isNamedExternalExportsDeclaration(node: ts.ExportDeclaration): node is NamedExternalExportsDeclaration {
    return node.exportClause !== undefined && node.moduleSpecifier !== undefined && ts.isNamedExports(node.exportClause);
}
