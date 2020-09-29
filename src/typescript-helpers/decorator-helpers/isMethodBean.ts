import * as ts from 'typescript';
import { isBeanDecorator } from './isBeanDecorator';

export function isMethodBean(node: ts.Node): node is ts.MethodDeclaration {
    return ts.isMethodDeclaration(node) && Boolean(node.decorators?.some(isBeanDecorator));
}
