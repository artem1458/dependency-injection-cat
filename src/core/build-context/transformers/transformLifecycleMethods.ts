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

export const transformLifecycleMethods = (contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]): ts.TransformerFactory<ts.SourceFile> => {
    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                const lifecycleDescriptor = LifecycleMethodsRepository.nodeToContextLifecycleDescriptor.get(node);

                if (lifecycleDescriptor?.nodeKind === 'method') {
                    const typedNode = lifecycleDescriptor.node as ts.MethodDeclaration;
                    const newBody = getNewBody(lifecycleDescriptor, contextDescriptorToIdentifierList);

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

const isBeanFromCurrentContext = (dependencyBeanContext: IContextDescriptor, lifecycleContext: IContextDescriptor): boolean =>
    dependencyBeanContext.id === lifecycleContext.id;

function getNewBody (lifecycleDescriptor: IContextLifecycleDescriptor, contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]): ts.Block {
    const node = lifecycleDescriptor.node as ts.MethodDeclaration;
    const nodeBody = node.body ?? factory.createBlock([]);

    const dependenciesStatements = Array.from(lifecycleDescriptor.dependencies.entries()).map(([parameterName, beanDescriptor]) => {
        if (isBeanFromCurrentContext(beanDescriptor.contextDescriptor, lifecycleDescriptor.contextDescriptor)) {
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
                            [factory.createStringLiteral(beanDescriptor.classMemberName ?? '')]
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

    return factory.updateBlock(
        nodeBody,
        [
            ...compact(dependenciesStatements),
            ...nodeBody.statements,
        ]
    );
}
