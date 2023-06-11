import ts from 'typescript';

import { CONSTANTS } from '../../../constants';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';

export type TDICatClass = 'CatContext';

export const isExtendsClass = (node: ts.Node, className: TDICatClass): node is ts.ClassDeclaration => {
    if (!ts.isClassDeclaration(node)) {
        return false;
    }

    const extendsHeritageClause = node.heritageClauses?.find(clause => clause.token === ts.SyntaxKind.ExtendsKeyword);

    if (!extendsHeritageClause) {
        return false;
    }

    const name = extendsHeritageClause.types[0].expression.getText();
    const sourceDescriptor = getNodeSourceDescriptorDeep(node.getSourceFile(), name);

    if (!sourceDescriptor) {
        return false;
    }

    return sourceDescriptor.name === className && sourceDescriptor.path === CONSTANTS.libraryName;
};
