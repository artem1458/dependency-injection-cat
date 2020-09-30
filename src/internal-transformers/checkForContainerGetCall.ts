import * as ts from 'typescript';
import { isContainerGetCall } from '../typescript-helpers/container-call/isContainerGetCall';

export const checkForContainerGetCall = (typeChecker: ts.TypeChecker): ts.TransformerFactory<ts.SourceFile> =>
    context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                if (ts.isCallExpression(node) && isContainerGetCall(typeChecker, node)) {
                    throw new Error(`You can not use container.get() in your diconfig files, please use Beans, ${node.getText()}, ${node.getSourceFile().fileName}`);
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
