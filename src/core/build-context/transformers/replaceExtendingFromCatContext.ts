import ts, { factory } from 'typescript';
import { IContextDescriptor } from '../../context/ContextRepository';
import { INTERNAL_CAT_CONTEXT_IMPORT } from './addNecessaryImports';
import { getDecoratorsOnly } from '../../utils/getDecoratorsOnly';

export const replaceExtendingFromCatContext = (contextDescriptor: IContextDescriptor): ts.TransformerFactory<ts.SourceFile> => {
    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                if (node === contextDescriptor.node) {
                    const classDeclaration = contextDescriptor.node;
                    const newHeritageClause = factory.createHeritageClause(
                        ts.SyntaxKind.ExtendsKeyword,
                        [factory.createExpressionWithTypeArguments(
                            factory.createPropertyAccessExpression(
                                factory.createIdentifier(INTERNAL_CAT_CONTEXT_IMPORT),
                                factory.createIdentifier('InternalCatContext')
                            ),
                            undefined
                        )]
                    );

                    return ts.factory.updateClassDeclaration(
                        classDeclaration,
                        [...getDecoratorsOnly(classDeclaration), ...classDeclaration.modifiers ?? []],
                        classDeclaration.name,
                        classDeclaration.typeParameters,
                        [newHeritageClause],
                        classDeclaration.members
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
};
