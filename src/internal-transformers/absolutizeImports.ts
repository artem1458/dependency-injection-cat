import * as ts from 'typescript';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';
import { PathResolver } from '../core/internal/ts-helpers/path-resolver/PathResolver';

export const absolutizeImports = (sourceFilePath: string): ts.TransformerFactory<ts.SourceFile> =>
    context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                if (ts.isImportDeclaration(node)) {
                    if (!node.moduleSpecifier) {
                        const sourceFileName = node.getSourceFile().fileName;
                        const nodeText = node.getFullText();
                        throw new Error(`Module specifier is empty, Path ${sourceFileName}, Node ${nodeText}`);
                    }

                    const importPath = removeQuotesFromString(node.moduleSpecifier.getText());
                    const resolvedPath = PathResolver.resolveWithoutExtension(sourceFilePath, importPath);
                    const pathWithoutExtension = resolvedPath.replace(/\.[^/.]+$/, '');

                    return ts.updateImportDeclaration(
                        node,
                        node.decorators,
                        node.modifiers,
                        node.importClause,
                        ts.createLiteral(pathWithoutExtension),
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
