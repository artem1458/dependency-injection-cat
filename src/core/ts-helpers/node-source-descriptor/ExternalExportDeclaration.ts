import * as ts from 'typescript';

export interface ExternalExportDeclaration extends ts.ExportDeclaration {
    exportClause: ts.NamedExportBindings;
    moduleSpecifier: ts.Expression;
}
export interface NamedExternalExportsDeclaration extends ts.ExportDeclaration {
    exportClause: ts.NamedExports;
    moduleSpecifier: ts.Expression;
}

export const isExternalExportDeclaration = (node: ts.ExportDeclaration): node is ExternalExportDeclaration =>
    node.exportClause !== undefined && node.moduleSpecifier !== undefined;

export const isNamedExternalExportsDeclaration = (node: ts.ExportDeclaration): node is NamedExternalExportsDeclaration =>
    node.exportClause !== undefined && node.moduleSpecifier !== undefined && ts.isNamedExports(node.exportClause);
