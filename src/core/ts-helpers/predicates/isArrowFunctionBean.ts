import * as ts from 'typescript';
import { ClassPropertyArrowFunction } from '../types';
import { isBeanDecorator } from './isBeanDecorator';

export const isArrowFunctionBean = (node: ts.Node): node is ClassPropertyArrowFunction => {
    if (!ts.isPropertyDeclaration(node)) {
        return false;
    }

    if (!node.decorators?.some(isBeanDecorator)) {
        return false;
    }

    if (node.initializer === undefined) {
        return false;
    }

    return ts.isArrowFunction(node.initializer);
};
