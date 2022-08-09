import ts, { factory } from 'typescript';
import { IBeanDescriptor } from '../../bean/BeanRepository';
import {
    IContextLifecycleDescriptor,
    ILifecycleDependencyDescriptor
} from '../../context-lifecycle/LifecycleMethodsRepository';
import {
    getGlobalContextIdentifierFromArrayOrCreateNewAndPush,
    TContextDescriptorToIdentifier
} from '../utils/getGlobalContextIdentifierFromArrayOrCreateNewAndPush';
import { IContextDescriptor } from '../../context/ContextRepository';
import { QualifiedTypeKind } from '../../ts-helpers/type-qualifier/QualifiedType';

export function buildDependenciesStatementsForLifecycle(
    lifecycleDescriptor: IContextLifecycleDescriptor,
    contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]
): (ts.VariableStatement | undefined)[] {
    return lifecycleDescriptor.dependencies.list().map(lifecycleDependencyDescriptor => {
        if (lifecycleDependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.PLAIN) {
            const qualifiedBeanDescriptor = lifecycleDependencyDescriptor.qualifiedBeans.firstOrNull();

            if (qualifiedBeanDescriptor === null) {
                return;
            }

            const beanCallExpression = buildBeanCallExpressionForSingleBeanForLifecycle(
                qualifiedBeanDescriptor,
                lifecycleDependencyDescriptor,
                lifecycleDescriptor,
                contextDescriptorToIdentifierList,
            );

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
                .map(beanDescriptor => buildBeanCallExpressionForSingleBeanForLifecycle(
                    beanDescriptor,
                    lifecycleDependencyDescriptor,
                    lifecycleDescriptor,
                    contextDescriptorToIdentifierList,
                ));

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

export function buildBeanCallExpressionForSingleBeanForLifecycle(
    beanDescriptor: IBeanDescriptor,
    dependencyDescriptor: ILifecycleDependencyDescriptor,
    contextLifecycleDescriptor: IContextLifecycleDescriptor,
    contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[],
): ts.Expression {
    if (isBeanFromCurrentContext(beanDescriptor.contextDescriptor, contextLifecycleDescriptor.contextDescriptor)) {
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

    const globalContextIdentifier = getGlobalContextIdentifierFromArrayOrCreateNewAndPush(
        beanDescriptor.contextDescriptor,
        contextDescriptorToIdentifierList,
    );

    let beanAccessExpression: ts.Expression = factory.createCallExpression(
        factory.createPropertyAccessExpression(
            factory.createPropertyAccessExpression(
                globalContextIdentifier,
                factory.createIdentifier(globalContextIdentifier.text),
            ),
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

function isBeanFromCurrentContext(dependencyBeanContext: IContextDescriptor, lifecycleContext: IContextDescriptor): boolean {
    return dependencyBeanContext.id === lifecycleContext.id;
}
