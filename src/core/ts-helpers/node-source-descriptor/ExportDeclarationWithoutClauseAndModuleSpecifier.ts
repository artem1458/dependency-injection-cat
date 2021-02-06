import * as ts from 'typescript';

export interface ExportDeclarationWithoutClauseAndModuleSpecifier extends ts.ExportDeclaration {
    exportClause: undefined;
    moduleSpecifier: ts.Expression;
}

export const isExportDeclarationWithoutClauseAndWithModuleSpecifier = (node: ts.ExportDeclaration): node is ExportDeclarationWithoutClauseAndModuleSpecifier =>
    node.exportClause === undefined && node.moduleSpecifier !== undefined;
