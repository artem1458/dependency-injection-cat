import ts from 'typescript';
import { isClassPropertyBean } from './isClassPropertyBean';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { isExpressionBean } from './isExpressionBean';
import { isEmbeddedBeanDecorator } from './isEmbeddedBeanDecorator';

export const isEmbeddedBean = (node: ts.Node): node is ts.PropertyDeclaration => {
    if (isClassPropertyBean(node) || isExpressionBean(node)) {
        return false;
    }

    if (!ts.isPropertyDeclaration(node)) {
        return false;
    }

    if (!node.decorators?.some(isEmbeddedBeanDecorator)) {
        return false;
    }

    if (node.initializer === undefined) {
        CompilationContext.reportError({
            node: node,
            message: 'Embedded Bean should hold value',
            filePath: node.getSourceFile().fileName,
        });

        return false;
    }

    return !ts.isArrowFunction(node.initializer);
};
