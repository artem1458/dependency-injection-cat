import * as ts from 'typescript';
import { isBeanDecorator } from './isBeanDecorator';
import { getDecoratorsOnly } from '../../utils/getDecoratorsOnly';

export const isMethodBean = (node: ts.Node): node is ts.MethodDeclaration =>
    ts.isMethodDeclaration(node) && Boolean(getDecoratorsOnly(node).some(isBeanDecorator));
