import * as ts from 'typescript';
import { PropertyDeclaration } from 'typescript';
import { isBeanDecorator } from './isBeanDecorator';
import { CompilationContext } from '../../../compilation-context/CompilationContext';

export const isPlainPropertyBean = (node: ts.Node): node is PropertyDeclaration => {
    if (!ts.isPropertyDeclaration(node)) {
        return false;
    }

    if (!node.decorators?.some(isBeanDecorator)) {
        return false;
    }

    if (node.initializer === undefined) {
        CompilationContext.reportError({
            node: node,
            message: 'Property Bean should hold value',
            filePath: node.getSourceFile().fileName,
        });

        return false;
    }

    return !ts.isArrowFunction(node.initializer);
};
