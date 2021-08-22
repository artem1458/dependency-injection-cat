import * as ts from 'typescript';
import { isContextLifecycleDecorator } from './getLifecycleTypes';

export const isContextLifecycleMethod = (node: ts.Node): node is ts.MethodDeclaration =>
    ts.isMethodDeclaration(node) && Boolean(node.decorators?.some(isContextLifecycleDecorator));
