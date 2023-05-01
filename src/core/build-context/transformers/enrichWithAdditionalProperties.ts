import ts, { factory } from 'typescript';
import { IContextDescriptor } from '../../context/ContextRepository';
import { LifecycleMethodsRepository } from '../../context-lifecycle/LifecycleMethodsRepository';
import { getBeanConfigObjectLiteral } from './getBeanConfigObjectLiteral';

export const enrichWithAdditionalProperties = (contextDescriptor: IContextDescriptor): ts.TransformerFactory<ts.ClassDeclaration> => {
    return () => contextNode => {
        const postConstructMethodNames = Array.from(LifecycleMethodsRepository.getLifecycleDescriptorsByContextDescriptorAndLifecycleType(
            contextDescriptor,
            'post-construct',
        )).map(it => it.classMemberName);
        const beforeDestructMethodNames = Array.from(LifecycleMethodsRepository.getLifecycleDescriptorsByContextDescriptorAndLifecycleType(
            contextDescriptor,
            'before-destruct',
        )).map(it => it.classMemberName);

        const lifecycleConfigProperty = factory.createObjectLiteralExpression(
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
        );

        //TODO Use class static init blocks
        const configInitProperty = factory.createPropertyDeclaration(
            [factory.createToken(ts.SyntaxKind.StaticKeyword)],
            factory.createIdentifier('dicat_staticInit'),
            undefined,
            undefined,
            factory.createCallExpression(
                factory.createParenthesizedExpression(factory.createArrowFunction(
                    undefined,
                    undefined,
                    [],
                    undefined,
                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    factory.createBlock(
                        [factory.createExpressionStatement(factory.createCallExpression(
                            factory.createPropertyAccessExpression(
                                factory.createIdentifier('Object'),
                                factory.createIdentifier('defineProperties')
                            ),
                            undefined,
                            [
                                factory.createThis(),
                                factory.createObjectLiteralExpression(
                                    [
                                        createObjectDefinePropertyPropertyAssignment('dicat_contextName', factory.createStringLiteral(contextDescriptor.name)),
                                        createObjectDefinePropertyPropertyAssignment('dicat_beanConfiguration', getBeanConfigObjectLiteral(contextDescriptor)),
                                        createObjectDefinePropertyPropertyAssignment('dicat_lifecycleConfiguration', lifecycleConfigProperty),
                                    ],
                                    true
                                )
                            ]
                        ))],
                        true
                    )
                )),
                undefined,
                []
            )
        );

        return factory.updateClassDeclaration(
            contextNode,
            contextNode.modifiers,
            contextNode.name,
            contextNode.typeParameters,
            contextNode.heritageClauses,
            [
                configInitProperty,
                ...contextNode.members,
            ]
        );
    };
};

function createObjectDefinePropertyPropertyAssignment(propertyName: string, value: ts.Expression): ts.PropertyAssignment {
    return factory.createPropertyAssignment(
        factory.createStringLiteral(propertyName),
        factory.createObjectLiteralExpression(
            [
                factory.createMethodDeclaration(
                    undefined,
                    undefined,
                    factory.createIdentifier('get'),
                    undefined,
                    undefined,
                    [],
                    undefined,
                    factory.createBlock(
                        [factory.createReturnStatement(value)],
                        true
                    )
                )
            ],
            true
        )
    );
}
