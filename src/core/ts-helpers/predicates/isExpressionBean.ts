import * as ts from 'typescript';
import { PropertyDeclaration } from 'typescript';
import { isBeanDecorator } from './isBeanDecorator';
import { isClassPropertyBean } from './isClassPropertyBean';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { IContextDescriptor } from '../../context/ContextRepository';
import { MissingInitializerError } from '../../../compilation-context/messages/errors/MissingInitializerError';
import { getDecoratorsOnly } from '../../utils/getDecoratorsOnly';

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

    if (!getDecoratorsOnly(node).some(isBeanDecorator)) {
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
