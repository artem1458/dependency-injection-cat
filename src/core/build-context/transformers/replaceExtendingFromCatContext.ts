import ts, { factory } from 'typescript';
import { getDecoratorsOnly } from '../../utils/getDecoratorsOnly';
import { PRIVATE_TOKEN } from '../constants';

export const INTERNAL_CAT_CONTEXT_IMPORT = `INTERNAL_CAT_CONTEXT_IMPORT${PRIVATE_TOKEN}`;

export const replaceExtendingFromCatContext = (): ts.TransformerFactory<ts.ClassDeclaration> => {
    return () => {
        return contextNode => {
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
                contextNode,
                [...getDecoratorsOnly(contextNode), ...contextNode.modifiers ?? []],
                contextNode.name,
                contextNode.typeParameters,
                [newHeritageClause],
                contextNode.members
            );
        };
    };
};
