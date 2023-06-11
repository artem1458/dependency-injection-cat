import ts, { SyntaxKind } from 'typescript';
import { getNodeSourceDescriptor } from './getNodeSourceDescriptor';

export const isExtendsCatContext = (node: ts.Node, program: ts.Program): node is ts.ClassDeclaration => {
    if (!ts.isClassDeclaration(node)) {
        return false;
    }

    const classExtends = node.heritageClauses
        ?.find(it => it.token === SyntaxKind.ExtendsKeyword)!.types[0].expression;

    if (!classExtends) {
        return false;
    }

    const nodeSourceDescriptor = getNodeSourceDescriptor(classExtends, program);

    return nodeSourceDescriptor !== null && nodeSourceDescriptor.isLibraryNode && nodeSourceDescriptor.originalName === 'CatContext';
};
