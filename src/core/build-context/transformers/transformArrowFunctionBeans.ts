import ts, { factory } from 'typescript';
import { BeanRepository, IBeanDescriptorWithId, TBeanNode } from '../../bean/BeanRepository';
import { BeanDependenciesRepository } from '../../bean-dependencies/BeanDependenciesRepository';
import { compact } from 'lodash';
import { isBeanDependencyFromCurrentContext } from '../utils/isBeanDependencyFromCurrentContext';
import {
    getGlobalContextIdentifierFromArrayOrCreateNewAndPush,
    TContextDescriptorToIdentifier
} from '../utils/getGlobalContextIdentifierFromArrayOrCreateNewAndPush';
import { ClassPropertyArrowFunction } from '../../ts-helpers/types';

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
    beanDescriptor: IBeanDescriptorWithId,
    contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]
): ts.ArrowFunction {
    const node = beanDescriptor.node as ClassPropertyArrowFunction;
    const arrowFunction = node.initializer;

    const dependencies = BeanDependenciesRepository.beanDependenciesRepository
        .get(beanDescriptor.contextDescriptor.name)?.get(beanDescriptor) ?? [];

    const dependenciesStatements = dependencies.map(dependencyDescriptor => {
        if (dependencyDescriptor.qualifiedBean === null) {
            return;
        }

        if (isBeanDependencyFromCurrentContext(beanDescriptor, dependencyDescriptor.qualifiedBean)) {
            return factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                    [factory.createVariableDeclaration(
                        factory.createIdentifier(dependencyDescriptor.parameterName),
                        undefined,
                        dependencyDescriptor.node.type,
                        factory.createCallExpression(
                            factory.createPropertyAccessExpression(
                                factory.createThis(),
                                factory.createIdentifier('getPrivateBean')
                            ),
                            undefined,
                            [factory.createStringLiteral(dependencyDescriptor.qualifiedBean?.classMemberName ?? '')]
                        )
                    )],
                    ts.NodeFlags.Const
                )
            );
        }

        const globalContextIdentifier = getGlobalContextIdentifierFromArrayOrCreateNewAndPush(
            dependencyDescriptor.qualifiedBean.contextDescriptor,
            contextDescriptorToIdentifierList,
        );

        return factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                    factory.createIdentifier(dependencyDescriptor.parameterName),
                    undefined,
                    dependencyDescriptor.node.type,
                    factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                            factory.createPropertyAccessExpression(
                                globalContextIdentifier,
                                factory.createIdentifier(globalContextIdentifier.text),
                            ),
                            factory.createIdentifier('getPrivateBean')
                        ),
                        undefined,
                        [factory.createStringLiteral(dependencyDescriptor.qualifiedBean.classMemberName)]
                    ),
                )],
                ts.NodeFlags.Const
            )
        );
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
