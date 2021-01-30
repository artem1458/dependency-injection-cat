import ts from 'typescript';
import { NamedClassDeclaration } from '../types';

export const findClassDeclarationInSourceFileByName = (sourceFile: ts.SourceFile, name: string): NamedClassDeclaration | null => {
    return sourceFile.statements
        .filter(isNamedExportClassDeclaration)
        .find(it => it.name.getText() === name) ?? null;
};

function isNamedExportClassDeclaration(node: ts.Node): node is NamedClassDeclaration {
    return ts.isClassDeclaration(node) && node.name !== undefined;
}
