import ts, { factory } from 'typescript';
import { IBeanDescriptor } from '../../bean/BeanRepository';
import { IContextLifecycleDescriptor, } from '../../context-lifecycle/LifecycleMethodsRepository';
import { QualifiedTypeKind } from '../../ts-helpers/type-qualifier/QualifiedType';

export function buildDependenciesStatementsForLifecycle(lifecycleDescriptor: IContextLifecycleDescriptor): (ts.VariableStatement | undefined)[] {
    return lifecycleDescriptor.dependencies.list().map(lifecycleDependencyDescriptor => {
        if (lifecycleDependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.PLAIN) {
            const qualifiedBeanDescriptor = lifecycleDependencyDescriptor.qualifiedBeans.firstOrNull();

            if (qualifiedBeanDescriptor === null) {
                return;
            }

            const beanCallExpression = buildBeanCallExpressionForSingleBeanForLifecycle(qualifiedBeanDescriptor);

            return factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                    [factory.createVariableDeclaration(
                        factory.createIdentifier(lifecycleDependencyDescriptor.parameterName),
                        undefined,
                        lifecycleDependencyDescriptor.qualifiedType.typeNode,
                        beanCallExpression
                    )],
                    ts.NodeFlags.Const
                )
            );
        }

        if (lifecycleDependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.LIST) {
            const beanCallExpressions = lifecycleDependencyDescriptor.qualifiedBeans.list()
                .map(beanDescriptor => buildBeanCallExpressionForSingleBeanForLifecycle(beanDescriptor));

            return factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                    [factory.createVariableDeclaration(
                        factory.createIdentifier(lifecycleDependencyDescriptor.parameterName),
                        undefined,
                        lifecycleDependencyDescriptor.qualifiedType.typeNode,
                        factory.createArrayLiteralExpression(
                            beanCallExpressions,
                            true,
                        )
                    )],
                    ts.NodeFlags.Const
                )
            );
        }
    });
}

function buildBeanCallExpressionForSingleBeanForLifecycle(beanDescriptor: IBeanDescriptor): ts.Expression {
    let beanAccessExpression: ts.Expression = factory.createCallExpression(
        factory.createPropertyAccessExpression(
            factory.createThis(),
            factory.createIdentifier('getPrivateBean')
        ),
        undefined,
        [factory.createStringLiteral(beanDescriptor.classMemberName)]
    );

    if (beanDescriptor.nestedProperty !== null) {
        beanAccessExpression = factory.createPropertyAccessExpression(
            beanAccessExpression,
            factory.createIdentifier(beanDescriptor.nestedProperty),
        );
    }

    return beanAccessExpression;
}
