import * as ts from 'typescript';
import { isContextLifecycleDecorator } from './getLifecycleTypes';
import { isArrowFunctionBean } from '../ts-helpers/predicates/isArrowFunctionBean';
import { isExpressionBean } from '../ts-helpers/predicates/isExpressionBean';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { IContextDescriptor } from '../context/ContextRepository';

export const isContextLifecycleArrowFunction = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    node: ts.Node
): node is ClassPropertyArrowFunction => {
    if (isArrowFunctionBean(compilationContext, contextDescriptor, node) || isExpressionBean(compilationContext, contextDescriptor, node)) {
        return false;
    }

    if (!ts.isPropertyDeclaration(node)) {
        return false;
    }

    if (!node.decorators?.some(isContextLifecycleDecorator)) {
        return false;
    }

    if (node.initializer === undefined) {
        return false;
    }

    return ts.isArrowFunction(node.initializer);
};
