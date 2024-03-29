import ts, { factory } from 'typescript';
import { compact } from 'lodash';
import { TContextDescriptorToIdentifier } from '../utils/getGlobalContextIdentifierFromArrayOrCreateNewAndPush';
import {
    IContextLifecycleDescriptor,
    LifecycleMethodsRepository
} from '../../context-lifecycle/LifecycleMethodsRepository';
import { buildDependenciesStatementsForLifecycle } from './buildBeanCallExpressionForSingleBeanForLifecycle';

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

function getNewBody (lifecycleDescriptor: IContextLifecycleDescriptor, contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]): ts.Block {
    const node = lifecycleDescriptor.node as ts.MethodDeclaration;
    const nodeBody = node.body ?? factory.createBlock([]);

    const dependenciesStatements = buildDependenciesStatementsForLifecycle(lifecycleDescriptor, contextDescriptorToIdentifierList);

    return factory.updateBlock(
        nodeBody,
        [
            ...compact(dependenciesStatements),
            ...nodeBody.statements,
        ]
    );
}
