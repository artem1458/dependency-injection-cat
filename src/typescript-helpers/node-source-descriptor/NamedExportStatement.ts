import * as ts from 'typescript';
import { get } from 'lodash';

type ExportModifier = ts.Token<ts.SyntaxKind.ExportKeyword>;

export interface NamedExportStatement extends ts.Statement {
    name: ts.Identifier;
    modifiers: ts.NodeArray<ts.Modifier> & ts.NodeArray<ExportModifier>;
}

export function isNamedExportStatement(node: ts.Statement): node is NamedExportStatement {
    const modifiers = node.modifiers ?? [];

    return get(node, 'name') !== undefined && modifiers.some(it => it.kind === ts.SyntaxKind.ExportKeyword);
}
