import ts, { factory } from 'typescript';
import { compact } from 'lodash';
import { TContextDescriptorToIdentifier } from '../utils/getGlobalContextIdentifierFromArrayOrCreateNewAndPush';
import {
    IContextLifecycleDescriptor,
    LifecycleMethodsRepository
} from '../../context-lifecycle/LifecycleMethodsRepository';
import { ClassPropertyArrowFunction } from '../../ts-helpers/types';
import { buildDependenciesStatementsForLifecycle } from './buildBeanCallExpressionForSingleBeanForLifecycle';

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
    const dependenciesStatements = buildDependenciesStatementsForLifecycle(lifecycleDescriptor, contextDescriptorToIdentifierList);

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

