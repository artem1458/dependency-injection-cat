import ts from 'typescript';
import { isExtendsClass, TDICatClass } from './predicates/isExtendsClass';

export const filterClassesNotExtendingDICatClass = (nodes: ts.Node[] | ts.NodeArray<ts.Node>, className: TDICatClass): ts.ClassDeclaration[] => {
    return nodes.filter(it => isExtendsClass(it, className)) as ts.ClassDeclaration[];
};
