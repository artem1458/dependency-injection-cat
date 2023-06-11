import ts from 'typescript';
import { getNodeSourceDescriptor } from './getNodeSourceDescriptor';

export const isPropertyBean = (node: ts.ClassElement, program: ts.Program): node is ts.PropertyDeclaration => {
    if (!ts.isPropertyDeclaration(node)) {
        return false;
    }

    const decorators = ts.getDecorators(node) ?? [];

    if (decorators.length === 0) {
        return false;
    }

    //TODO report error when have more than one Bean decorator
    return decorators.some(decorator => {
        if (ts.isIdentifier(decorator.expression)) {
            const nodeSourceDescriptor = getNodeSourceDescriptor(decorator.expression, program);

            if (nodeSourceDescriptor === null) {
                return false;
            }

            return nodeSourceDescriptor.originalName === 'Bean';
        }

        if (ts.isCallExpression(decorator.expression)) {
            const nodeSourceDescriptor = getNodeSourceDescriptor(decorator.expression.expression, program);

            if (nodeSourceDescriptor === null) {
                return false;
            }

            return nodeSourceDescriptor.originalName === 'Bean';
        }
    });
};
