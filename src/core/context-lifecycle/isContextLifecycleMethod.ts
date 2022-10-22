import * as ts from 'typescript';
import { isContextLifecycleDecorator } from './getLifecycleTypes';
import { getDecoratorsOnly } from '../utils/getDecoratorsOnly';

export const isContextLifecycleMethod = (node: ts.Node): node is ts.MethodDeclaration =>
    ts.isMethodDeclaration(node) && Boolean(getDecoratorsOnly(node).some(isContextLifecycleDecorator));
