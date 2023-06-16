import ts, { factory } from 'typescript';
import { getBeanConfigObjectLiteral } from './getBeanConfigObjectLiteral';
import { Context } from '../../context/Context';
import { BeanKind } from '../../bean/BeanKind';
import { BeanLifecycle } from '../../../external/InternalCatContext';

export const enrichWithAdditionalProperties = (node: ts.ClassDeclaration, context: Context): ts.ClassDeclaration => {
    const lifecycleBeanData: Record<BeanLifecycle, string[]> = {
        'post-construct': [],
        'before-destruct': [],
    };

    context.beans.forEach(bean => {
        if (bean.kind === BeanKind.LIFECYCLE_METHOD || bean.kind === BeanKind.LIFECYCLE_ARROW_FUNCTION) {
            bean.lifecycle?.forEach(lifecycle => {
                lifecycleBeanData[lifecycle].push(bean.classMemberName);
            });
        }
    });

    const lifecycleConfigProperty = factory.createObjectLiteralExpression(
        Object.entries(lifecycleBeanData).map(([lifecycle, methodNames]) => {
            return factory.createPropertyAssignment(
                factory.createStringLiteral(lifecycle),
                factory.createArrayLiteralExpression(
                    methodNames.map(it => factory.createStringLiteral(it)),
                    false
                )
            );
        }),
        false,
    );

    //TODO Use class static init blocks
    const configInitProperty = factory.createPropertyDeclaration(
        [factory.createToken(ts.SyntaxKind.StaticKeyword)],
        factory.createIdentifier('dicat_static_init'),
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
                                    createObjectDefinePropertyPropertyAssignment('dicat_static_contextName', context.name ? factory.createStringLiteral(context.name) : factory.createNull()),
                                    createObjectDefinePropertyPropertyAssignment('dicat_static_beanConfiguration', getBeanConfigObjectLiteral(context)),
                                    createObjectDefinePropertyPropertyAssignment('dicat_static_lifecycleConfiguration', lifecycleConfigProperty),
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
        node,
        node.modifiers,
        node.name,
        node.typeParameters,
        node.heritageClauses,
        [
            configInitProperty,
            ...node.members,
        ]
    );
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
