import * as ts from 'typescript';
import { isBean } from '../utils/is-bean/isBean';

export const makeBeansStatic: ts.TransformerFactory<ts.SourceFile> =
    context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                if (isBean(node)) {
                    return ts.updateMethod(
                        node,
                        undefined,
                        [ts.createToken(ts.SyntaxKind.StaticKeyword)],
                        undefined,
                        node.name,
                        undefined,
                        node.typeParameters,
                        node.parameters,
                        node.type,
                        node.body,
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
