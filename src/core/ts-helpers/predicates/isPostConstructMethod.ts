import * as ts from 'typescript';
import { isPostConstructDecorator } from './isPostConstructDecorator';

export const isPostConstructMethod = (node: ts.Node): node is ts.MethodDeclaration =>
    ts.isMethodDeclaration(node) && Boolean(node.decorators?.some(isPostConstructDecorator));
