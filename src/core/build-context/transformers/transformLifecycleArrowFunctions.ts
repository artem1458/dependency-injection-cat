import ts, { factory } from 'typescript';
import { compact } from 'lodash';
import {
    getGlobalContextIdentifierFromArrayOrCreateNewAndPush,
    TContextDescriptorToIdentifier
} from '../utils/getGlobalContextIdentifierFromArrayOrCreateNewAndPush';
import {
    IContextLifecycleDescriptor,
    LifecycleMethodsRepository
} from '../../context-lifecycle/LifecycleMethodsRepository';
import { IContextDescriptor } from '../../context/ContextRepository';
import { ClassPropertyArrowFunction } from '../../ts-helpers/types';

export const transformLifecycleArrowFunctions = (contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]): ts.TransformerFactory<ts.SourceFile> => {
    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                const lifecycleDescriptor = LifecycleMethodsRepository.nodeToContextLifecycleDescriptor.get(node) ?? null;

                if (lifecycleDescriptor?.nodeKind === 'arrow-function') {
                    const typedNode = lifecycleDescriptor.node as ClassPropertyArrowFunction;
                    const newArrowFunction = getTransformedArrowFunction(lifecycleDescriptor, contextDescriptorToIdentifierList);

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
    lifecycleDescriptor: IContextLifecycleDescriptor,
    contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]
): ts.ArrowFunction {
    const node = lifecycleDescriptor.node as ClassPropertyArrowFunction;
    const arrowFunction = node.initializer;

    const dependenciesStatements = Array.from(lifecycleDescriptor.dependencies.entries()).map(([parameterName, beanDescriptor]) => {
        if (isBeanFromCurrentContext(lifecycleDescriptor.contextDescriptor, beanDescriptor.contextDescriptor)) {
            return factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                    [factory.createVariableDeclaration(
                        factory.createIdentifier(parameterName),
                        undefined,
                        beanDescriptor.node.type,
                        factory.createCallExpression(
                            factory.createPropertyAccessExpression(
                                factory.createThis(),
                                factory.createIdentifier('getPrivateBean')
                            ),
                            undefined,
                            [factory.createStringLiteral(beanDescriptor.classMemberName)]
                        )
                    )],
                    ts.NodeFlags.Const
                )
            );
        }

        const globalContextIdentifier = getGlobalContextIdentifierFromArrayOrCreateNewAndPush(
            beanDescriptor.contextDescriptor,
            contextDescriptorToIdentifierList,
        );

        return factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                    factory.createIdentifier(parameterName),
                    undefined,
                    beanDescriptor.node.type,
                    factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                            factory.createPropertyAccessExpression(
                                globalContextIdentifier,
                                factory.createIdentifier(globalContextIdentifier.text),
                            ),
                            factory.createIdentifier('getPrivateBean')
                        ),
                        undefined,
                        [factory.createStringLiteral(beanDescriptor.classMemberName)]
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


const isBeanFromCurrentContext = (dependencyBeanContext: IContextDescriptor, lifecycleContext: IContextDescriptor): boolean =>
    dependencyBeanContext.id === lifecycleContext.id;
