import * as ts from 'typescript';
import path from 'path';
import { isPathRelative } from '../utils/isPathRelative';
import { parseString } from '../utils/parseString';


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

                    const importPath = parseString(node.moduleSpecifier.getText());

                    if (isPathRelative(importPath)) {
                        const newSourceFilePath = path.dirname(sourceFilePath);
                        const newPath = path.resolve(newSourceFilePath, importPath);
                        const newNode = ts.getMutableClone(node);

                        newNode.moduleSpecifier = ts.createLiteral(newPath);

                        return newNode;
                    }

                    return node;
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
