import ts, { factory } from 'typescript';
import { IContextDescriptor } from '../../context/ContextRepository';
import { LifecycleMethodsRepository } from '../../context-lifecycle/LifecycleMethodsRepository';
import { PRIVATE_TOKEN } from '../constants';

export const LIFECYCLE_CONFIG_VARIABLE_NAME = `_LIFECYCLE_CONFIG_${PRIVATE_TOKEN}`;

export const addLifecycleConfiguration = (contextDescriptor: IContextDescriptor): ts.TransformerFactory<ts.SourceFile> => {
    return () => sourceFile => {
        const postConstructMethodNames = Array.from(LifecycleMethodsRepository.getLifecycleDescriptorsByContextDescriptorAndLifecycleType(
            contextDescriptor,
            'post-construct',
        )).map(it => it.classMemberName);
        const beforeDestructMethodNames = Array.from(LifecycleMethodsRepository.getLifecycleDescriptorsByContextDescriptorAndLifecycleType(
            contextDescriptor,
            'before-destruct',
        )).map(it => it.classMemberName);

        return ts.factory.updateSourceFile(
            sourceFile,
            [
                ...sourceFile.statements,
                factory.createVariableStatement(
                    undefined,
                    factory.createVariableDeclarationList(
                        [factory.createVariableDeclaration(
                            factory.createIdentifier(LIFECYCLE_CONFIG_VARIABLE_NAME),
                            undefined,
                            factory.createTypeReferenceNode(
                                factory.createIdentifier('Record'),
                                [
                                    factory.createUnionTypeNode([
                                        factory.createLiteralTypeNode(factory.createStringLiteral('post-construct')),
                                        factory.createLiteralTypeNode(factory.createStringLiteral('before-destruct'))
                                    ]),
                                    factory.createArrayTypeNode(factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword))
                                ]
                            ),
                            factory.createObjectLiteralExpression(
                                [
                                    factory.createPropertyAssignment(
                                        factory.createStringLiteral('post-construct'),
                                        factory.createArrayLiteralExpression(
                                            postConstructMethodNames.map(it => factory.createStringLiteral(it)),
                                            false
                                        )
                                    ),
                                    factory.createPropertyAssignment(
                                        factory.createStringLiteral('before-destruct'),
                                        factory.createArrayLiteralExpression(
                                            beforeDestructMethodNames.map(it => factory.createStringLiteral(it)),
                                            false
                                        )
                                    )
                                ],
                                true
                            )
                        )],
                        ts.NodeFlags.Const
                    )
                )
            ]
        );
    };
};
