import * as ts from 'typescript';

export interface ExportDeclarationWithoutClauseAndModuleSpecifier extends ts.ExportDeclaration {
    exportClause: undefined;
    moduleSpecifier: ts.Expression;
}

export function isExportDeclarationWithoutClauseAndWithModuleSpecifier(node: ts.ExportDeclaration): node is ExportDeclarationWithoutClauseAndModuleSpecifier {
    return node.exportClause === undefined && node.moduleSpecifier !== undefined;
}
