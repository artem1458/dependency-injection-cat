import ts, { factory } from 'typescript';
import { compact } from 'lodash';
import { IContextLifecycleDescriptor } from '../../context-lifecycle/LifecycleMethodsRepository';
import { buildDependenciesStatementsForLifecycle } from './buildBeanCallExpressionForSingleBeanForLifecycle';

export const transformLifecycleMethod = (lifecycleDescriptor: IContextLifecycleDescriptor): ts.MethodDeclaration => {
    const typedNode = lifecycleDescriptor.node as ts.MethodDeclaration;
    const newBody = getNewBody(lifecycleDescriptor);

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

function getNewBody(lifecycleDescriptor: IContextLifecycleDescriptor): ts.Block {
    const node = lifecycleDescriptor.node as ts.MethodDeclaration;
    const nodeBody = node.body ?? factory.createBlock([]);

    const dependenciesStatements = buildDependenciesStatementsForLifecycle(lifecycleDescriptor);

    return factory.updateBlock(
        nodeBody,
        [
            ...compact(dependenciesStatements),
            ...nodeBody.statements,
        ]
    );
}
