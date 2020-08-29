import * as ts from 'typescript';
import { isBeanDecorator } from './isBeanDecorator';

export function isClassPropertyBean(node: ts.Node): node is ts.PropertyDeclaration {
    return ts.isPropertyDeclaration(node) && Boolean(node.decorators?.some(isBeanDecorator));
}
