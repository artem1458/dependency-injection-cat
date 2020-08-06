import * as ts from 'typescript';
import { isConfigDeclaration } from '../utils/isConfigDeclaration';
import { getPrivateInstanceIdentifier } from '../utils/getPrivateInstanceIdentifier';
import { getPublicInstanceIdentifier } from '../utils/getPublicInstanceIdentifier';

export const makeFactorySingleton: ts.TransformerFactory<ts.SourceFile> =
    context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                if (isConfigDeclaration(node)) {
                    const nodeName = node.name;
                    if (nodeName === undefined) {
                        throw new Error('Configs should be named class declaration'); //TODO Add more readable error
                    }

                    const configName = nodeName.getText();
                    const privateInstanceIdentifier = getPrivateInstanceIdentifier(configName);
                    const publicInstanceIdentifier = getPublicInstanceIdentifier(configName);
                    const newClassMembers = [
                        ts.createProperty(
                            undefined,
                            [
                                ts.createModifier(ts.SyntaxKind.PrivateKeyword),
                                ts.createModifier(ts.SyntaxKind.StaticKeyword)
                            ],
                            privateInstanceIdentifier,
                            undefined,
                            ts.createTypeReferenceNode(
                                nodeName,
                                undefined
                            ),
                            undefined
                        ),
                        ts.createGetAccessor(
                            undefined,
                            [ts.createModifier(ts.SyntaxKind.StaticKeyword)],
                            publicInstanceIdentifier,
                            [],
                            ts.createTypeReferenceNode(
                                nodeName,
                                undefined
                            ),
                            ts.createBlock(
                                [
                                    ts.createIf(
                                        ts.createPrefix(
                                            ts.SyntaxKind.ExclamationToken,
                                            ts.createPropertyAccess(
                                                nodeName,
                                                privateInstanceIdentifier
                                            )
                                        ),
                                        ts.createBlock(
                                            [ts.createExpressionStatement(ts.createBinary(
                                                ts.createPropertyAccess(
                                                    nodeName,
                                                    privateInstanceIdentifier
                                                ),
                                                ts.createToken(ts.SyntaxKind.EqualsToken),
                                                ts.createNew(
                                                    nodeName,
                                                    undefined,
                                                    []
                                                )
                                            ))],
                                            true
                                        ),
                                        undefined
                                    ),
                                    ts.createReturn(ts.createPropertyAccess(
                                        nodeName,
                                        privateInstanceIdentifier
                                    ))
                                ],
                                true
                            )
                        )
                    ]


                    return ts.updateClassDeclaration(
                        node,
                        node.decorators,
                        node.modifiers,
                        nodeName,
                        node.typeParameters,
                        node.heritageClauses,
                        [
                            ...newClassMembers,
                            ...node.members,
                        ],
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
