import ts, { factory } from 'typescript';
import { IBeanDescriptorWithId } from '../../bean/BeanRepository';
import { BeanDependenciesRepository } from '../../bean-dependencies/BeanDependenciesRepository';
import { compact } from 'lodash';
import { QualifiedTypeKind } from '../../ts-helpers/type-qualifier/QualifiedType';
import { getCallExpressionForBean } from './getCallExpressionForBean';

export const transformMethodBean = (beanDescriptor: IBeanDescriptorWithId): ts.MethodDeclaration => {
    const typedNode = beanDescriptor.node as ts.MethodDeclaration;
    const newBody = getNewBody(beanDescriptor);

    return factory.updateMethodDeclaration(
        typedNode,
        undefined,
        undefined,
        typedNode.name,
        undefined,
        undefined,
        [],
        typedNode.type,
        newBody,
    );
};

function getNewBody(parentBeanDescriptor: IBeanDescriptorWithId): ts.Block {
    const node = parentBeanDescriptor.node as ts.MethodDeclaration;
    const nodeBody = node.body ?? factory.createBlock([]);

    const dependencies = BeanDependenciesRepository.data
        .get(parentBeanDescriptor.contextDescriptor.name)?.get(parentBeanDescriptor) ?? [];

    const dependenciesStatements = dependencies.map(dependencyDescriptor => {
        if (dependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.PLAIN) {
            const qualifiedBeanDescriptor = dependencyDescriptor.qualifiedBeans.firstOrNull();

            if (qualifiedBeanDescriptor === null) {
                return;
            }

            const callExpressionForBean = getCallExpressionForBean(qualifiedBeanDescriptor);

            return factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                    [factory.createVariableDeclaration(
                        factory.createIdentifier(dependencyDescriptor.parameterName),
                        undefined,
                        dependencyDescriptor.node.type,
                        callExpressionForBean
                    )],
                    ts.NodeFlags.Const
                )
            );
        }

        if (dependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.LIST) {
            const callExpressionForBeans = dependencyDescriptor.qualifiedBeans.list()
                .map(qualifiedBean => getCallExpressionForBean(qualifiedBean));

            return factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                    [factory.createVariableDeclaration(
                        factory.createIdentifier(dependencyDescriptor.parameterName),
                        undefined,
                        dependencyDescriptor.node.type,
                        factory.createArrayLiteralExpression(
                            callExpressionForBeans,
                            true,
                        )
                    )],
                    ts.NodeFlags.Const
                )
            );
        }

    });

    return factory.updateBlock(
        nodeBody,
        [
            ...compact(dependenciesStatements),
            ...nodeBody.statements,
        ]
    );
}
