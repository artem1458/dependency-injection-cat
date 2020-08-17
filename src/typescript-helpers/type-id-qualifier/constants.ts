import { SyntaxKind } from 'typescript';

export const typeKeywords: SyntaxKind[] = [
    SyntaxKind.AnyKeyword,
    SyntaxKind.UnknownKeyword,
    SyntaxKind.NumberKeyword,
    SyntaxKind.BooleanKeyword,
    SyntaxKind.BigIntKeyword,
    SyntaxKind.ObjectKeyword,
    SyntaxKind.StringKeyword,
    SyntaxKind.SymbolKeyword,
    SyntaxKind.ThisKeyword,
    SyntaxKind.VoidKeyword,
    SyntaxKind.UndefinedKeyword,
    SyntaxKind.NullKeyword,
    SyntaxKind.NeverKeyword,
];

export const typeKeywordsDictionary: Record<number, string> = {
    [SyntaxKind.AnyKeyword]: 'any',
    [SyntaxKind.UnknownKeyword]: 'unknown',
    [SyntaxKind.NumberKeyword]: 'number',
    [SyntaxKind.BooleanKeyword]: 'boolean',
    [SyntaxKind.BigIntKeyword]: 'bigInt',
    [SyntaxKind.ObjectKeyword]: 'object',
    [SyntaxKind.StringKeyword]: 'string',
    [SyntaxKind.SymbolKeyword]: 'symbol',
    [SyntaxKind.ThisKeyword]: 'this',
    [SyntaxKind.VoidKeyword]: 'void',
    [SyntaxKind.UndefinedKeyword]: 'undefined',
    [SyntaxKind.NullKeyword]: 'null',
    [SyntaxKind.NeverKeyword]: 'never',
};
