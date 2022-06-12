import ts from 'typescript';
import { isClassPropertyBean } from './isClassPropertyBean';
import { isExpressionBean } from './isExpressionBean';
import { isEmbeddedBeanDecorator } from './isEmbeddedBeanDecorator';
import { CompilationContext } from '../../../build-context/CompilationContext';
import { IContextDescriptor } from '../../context/ContextRepository';
import { MissingInitializerError } from '../../../exceptions/compilation/errors/MissingInitializerError';

export const isEmbeddedBean = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    node: ts.Node
): node is ts.PropertyDeclaration => {
    if (isClassPropertyBean(node) || isExpressionBean(compilationContext, contextDescriptor, node)) {
        return false;
    }

    if (!ts.isPropertyDeclaration(node)) {
        return false;
    }

    if (!node.decorators?.some(isEmbeddedBeanDecorator)) {
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
