import ts, { factory } from 'typescript';
import { compact } from 'lodash';
import { IContextLifecycleDescriptor } from '../../context-lifecycle/LifecycleMethodsRepository';
import { ClassPropertyArrowFunction } from '../../ts-helpers/types';
import { buildDependenciesStatementsForLifecycle } from './buildBeanCallExpressionForSingleBeanForLifecycle';

export const transformLifecycleArrowFunction = (lifecycleDescriptor: IContextLifecycleDescriptor): ts.PropertyDeclaration => {
    const typedNode = lifecycleDescriptor.node as ClassPropertyArrowFunction;
    const newArrowFunction = getTransformedArrowFunction(lifecycleDescriptor);

    return factory.updatePropertyDeclaration(
        typedNode,
        undefined,
        typedNode.name,
        typedNode.questionToken,
        typedNode.type,
        newArrowFunction,
    );
};

function getTransformedArrowFunction(lifecycleDescriptor: IContextLifecycleDescriptor): ts.ArrowFunction {
    const node = lifecycleDescriptor.node as ClassPropertyArrowFunction;
    const arrowFunction = node.initializer;
    const dependenciesStatements = buildDependenciesStatementsForLifecycle(lifecycleDescriptor);

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

