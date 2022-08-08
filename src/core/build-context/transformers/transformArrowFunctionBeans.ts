import ts, { factory } from 'typescript';
import { BeanRepository, IBeanDescriptorWithId, TBeanNode } from '../../bean/BeanRepository';
import { BeanDependenciesRepository } from '../../bean-dependencies/BeanDependenciesRepository';
import { compact } from 'lodash';
import { TContextDescriptorToIdentifier } from '../utils/getGlobalContextIdentifierFromArrayOrCreateNewAndPush';
import { ClassPropertyArrowFunction } from '../../ts-helpers/types';
import { QualifiedTypeKind } from '../../ts-helpers/type-qualifier/QualifiedType';
import { getCallExpressionForBean } from './getCallExpressionForBean';

export const transformArrowFunctionBeans = (contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]): ts.TransformerFactory<ts.SourceFile> => {
    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                const beanDescriptor = BeanRepository.beanNodeToBeanDescriptorMap.get(node as TBeanNode) ?? null;

                if (beanDescriptor?.beanKind === 'arrowFunction') {
                    const typedNode = beanDescriptor.node as ClassPropertyArrowFunction;
                    const newArrowFunction = getTransformedArrowFunction(beanDescriptor, contextDescriptorToIdentifierList);

                    return factory.updatePropertyDeclaration(
                        typedNode,
                        undefined,
                        undefined,
                        typedNode.name,
                        typedNode.questionToken,
                        typedNode.type,
                        newArrowFunction,
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
};

function getTransformedArrowFunction (
    parentBeanDescriptor: IBeanDescriptorWithId,
    contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]
): ts.ArrowFunction {
    const node = parentBeanDescriptor.node as ClassPropertyArrowFunction;
    const arrowFunction = node.initializer;

    const dependencies = BeanDependenciesRepository.data
        .get(parentBeanDescriptor.contextDescriptor.name)?.get(parentBeanDescriptor) ?? [];

    const dependenciesStatements = dependencies.map(dependencyDescriptor => {
        if (dependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.PLAIN) {
            const qualifiedBeanDescriptor = dependencyDescriptor.qualifiedBeans.firstOrNull();

            if (qualifiedBeanDescriptor === null) {
                return;
            }

            const expression = getCallExpressionForBean(
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
                        expression,
                    )],
                    ts.NodeFlags.Const
                )
            );
        }

        if (dependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.LIST) {
            const expressions = dependencyDescriptor.qualifiedBeans.list()
                .map(beanDescriptor => getCallExpressionForBean(
                    beanDescriptor,
                    parentBeanDescriptor,
                    contextDescriptorToIdentifierList
                ));

            return factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                    [factory.createVariableDeclaration(
                        factory.createIdentifier(dependencyDescriptor.parameterName),
                        undefined,
                        dependencyDescriptor.node.type,
                        factory.createArrayLiteralExpression(
                            expressions,
                            true
                        ),
                    )],
                    ts.NodeFlags.Const
                )
            );
        }
    });

    let newBody: ts.Block;

    if (ts.isBlock(arrowFunction.body)) {
        newBody = factory.createBlock(
            [
                ...compact(dependenciesStatements),
                ...arrowFunction.body.statements,
            ],
            true,
        );
    } else {
        newBody = factory.createBlock(
            [
                ...compact(dependenciesStatements),
                factory.createReturnStatement(arrowFunction.body),
            ],
            true,
        );
    }

    return factory.updateArrowFunction(
        arrowFunction,
        arrowFunction.modifiers,
        arrowFunction.typeParameters,
        [],
        arrowFunction.type,
        arrowFunction.equalsGreaterThanToken,
        newBody,
    );
}
