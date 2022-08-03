import ts, { SyntaxKind } from 'typescript';
import { NamedClassDeclaration } from '../types';
import { isNamedClassDeclaration } from './isNamedClassDeclaration';

export const findClassDeclarationInSourceFileByName = (sourceFile: ts.SourceFile, name: string): NamedClassDeclaration | null => {
    return sourceFile.statements
        .filter(isNamedExportClassDeclaration)
        .find(it => it.name.getText() === name) ?? null;
};

export function isNamedExportClassDeclaration(node: ts.Node): node is NamedClassDeclaration {
    return isNamedClassDeclaration(node) && (node.modifiers?.some(it => it.kind === SyntaxKind.ExportKeyword) ?? false);
}
