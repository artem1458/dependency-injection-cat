import * as ts from 'typescript';

export const addImportsInFactory = (imports: ts.ImportDeclaration[]): ts.TransformerFactory<ts.SourceFile> =>
    context => sourceFile => ts.updateSourceFileNode(
        sourceFile,
        [
            ...imports,
            ...sourceFile.statements,
        ],
    );
