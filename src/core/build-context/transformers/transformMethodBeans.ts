import ts, { factory } from 'typescript';
import { BeanRepository, IBeanDescriptorWithId, TBeanNode } from '../../bean/BeanRepository';
import { BeanDependenciesRepository } from '../../bean-dependencies/BeanDependenciesRepository';
import { compact } from 'lodash';
import { TContextDescriptorToIdentifier } from '../utils/getGlobalContextIdentifierFromArrayOrCreateNewAndPush';
import { QualifiedTypeKind } from '../../ts-helpers/type-qualifier/QualifiedType';
import { getCallExpressionForBean } from './getCallExpressionForBean';

export const transformMethodBeans = (contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]): ts.TransformerFactory<ts.SourceFile> => {
    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                const beanDescriptor = BeanRepository.beanNodeToBeanDescriptorMap.get(node as TBeanNode) ?? null;

                if (beanDescriptor?.beanKind === 'method') {
                    const typedNode = beanDescriptor.node as ts.MethodDeclaration;
                    const newBody = getNewBody(beanDescriptor, contextDescriptorToIdentifierList);

                    return factory.updateMethodDeclaration(
                        typedNode,
                        undefined,
                        undefined,
                        undefined,
                        typedNode.name,
                        undefined,
                        undefined,
                        [],
                        typedNode.type,
                        newBody,
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
};

function getNewBody (parentBeanDescriptor: IBeanDescriptorWithId, contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]): ts.Block {
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

            const callExpressionForBean = getCallExpressionForBean(
                qualifiedBeanDescriptor,
                parentBeanDescriptor,
                contextDescriptorToIdentifierList,
            );

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
                .map(qualifiedBean => getCallExpressionForBean(
                    qualifiedBean,
                    parentBeanDescriptor,
                    contextDescriptorToIdentifierList,
                ));

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
