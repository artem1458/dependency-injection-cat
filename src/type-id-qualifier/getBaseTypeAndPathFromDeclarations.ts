import * as ts from 'typescript';
import { get } from 'lodash';
import { INodeSourceDescriptor, TNamedAvailableTypes } from './types';

export function getBaseTypeAndPathFromStatements(sourceFile: ts.SourceFile, nameToFind: string): INodeSourceDescriptor | undefined {
    const statement = sourceFile.statements.filter(isNamedExportStatement).find(it => it.name.escapedText === nameToFind);
    if (statement === undefined) {
        return undefined;
    }

    return {
        path: sourceFile.fileName,
        name: nameToFind,
    };
}

function isNamedExportStatement(statement: ts.Statement): statement is TNamedAvailableTypes {
    switch (statement.kind) {
        case ts.SyntaxKind.ClassDeclaration:
        case ts.SyntaxKind.InterfaceDeclaration:
        case ts.SyntaxKind.TypeAliasDeclaration:
        case ts.SyntaxKind.NamespaceExportDeclaration:
        case ts.SyntaxKind.ModuleDeclaration:
            return get(statement, 'name') !== undefined && isExportStatement(statement);
        default:
            return false;
    }
}

function isExportStatement(statement: ts.Statement): boolean {
    const modifiers = statement.modifiers || [] as unknown as ts.NodeArray<ts.Modifier>;
    const modifiersKinds = modifiers.map(it => it.kind);

    return modifiersKinds.includes(ts.SyntaxKind.ExportKeyword);
}
