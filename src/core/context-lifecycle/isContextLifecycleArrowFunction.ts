import * as ts from 'typescript';
import { isContextLifecycleDecorator } from './getLifecycleTypes';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { isArrowFunctionBean } from '../ts-helpers/predicates/isArrowFunctionBean';
import { isExpressionBean } from '../ts-helpers/predicates/isExpressionBean';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';

export const isContextLifecycleArrowFunction = (node: ts.Node): node is ClassPropertyArrowFunction => {
    if (isArrowFunctionBean(node) || isExpressionBean(node)) {
        return false;
    }

    if (!ts.isPropertyDeclaration(node)) {
        return false;
    }

    if (!node.decorators?.some(isContextLifecycleDecorator)) {
        return false;
    }

    if (node.initializer === undefined) {
        CompilationContext.reportError({
            node: node,
            message: 'Context lifecycle method should be initialized',
            filePath: node.getSourceFile().fileName,
        });

        return false;
    }

    return ts.isArrowFunction(node.initializer);
};
