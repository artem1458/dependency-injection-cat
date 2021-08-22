import * as ts from 'typescript';
import { ClassPropertyArrowFunction } from '../types';
import { isBeanDecorator } from './isBeanDecorator';
import { CompilationContext } from '../../../compilation-context/CompilationContext';

export const isArrowFunctionBean = (node: ts.Node): node is ClassPropertyArrowFunction => {
    if (!ts.isPropertyDeclaration(node)) {
        return false;
    }

    if (!node.decorators?.some(isBeanDecorator)) {
        return false;
    }

    if (node.initializer === undefined) {
        CompilationContext.reportError({
            node: node,
            message: 'Arrow function Bean should be initialized',
            filePath: node.getSourceFile().fileName,
        });

        return false;
    }

    return ts.isArrowFunction(node.initializer);
};
