import ts from 'typescript';

import { libraryName } from '../../../../constants/libraryName';
import { getNodeSourceDescriptorDeep } from '../node-source-descriptor';

export const isExtendsCatContextContext = (node: ts.Node): node is ts.ClassDeclaration => {
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

    return sourceDescriptor.name === 'CatContext' && sourceDescriptor.path === libraryName;
};
