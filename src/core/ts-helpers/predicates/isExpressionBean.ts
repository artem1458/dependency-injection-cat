import * as ts from 'typescript';
import { PropertyDeclaration } from 'typescript';
import { isBeanDecorator } from './isBeanDecorator';
import { isClassPropertyBean } from './isClassPropertyBean';
import { CompilationContext } from '../../../build-context/CompilationContext';
import { IContextDescriptor } from '../../context/ContextRepository';
import { MissingInitializerError } from '../../../exceptions/compilation/errors/MissingInitializerError';

export const isExpressionBean = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    node: ts.Node
): node is PropertyDeclaration => {
    if (isClassPropertyBean(node)) {
        return false;
    }

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

    return !ts.isArrowFunction(node.initializer);
};
