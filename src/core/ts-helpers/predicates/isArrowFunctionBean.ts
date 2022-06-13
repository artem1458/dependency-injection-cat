import * as ts from 'typescript';
import { ClassPropertyArrowFunction } from '../types';
import { isBeanDecorator } from './isBeanDecorator';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { IContextDescriptor } from '../../context/ContextRepository';
import { MissingInitializerError } from '../../../compilation-context/messages/errors/MissingInitializerError';

export const isArrowFunctionBean = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    node: ts.Node
): node is ClassPropertyArrowFunction => {
    if (!ts.isPropertyDeclaration(node)) {
        return false;
    }

    if (!node.decorators?.some(isBeanDecorator)) {
        return false;
    }

    if (node.initializer === undefined) {
        compilationContext.report(new MissingInitializerError(
            null,
            node,
            contextDescriptor.node,
        ));

        return false;
    }

    return ts.isArrowFunction(node.initializer);
};
