import * as ts from 'typescript';

export function isConfigDeclaration(node: ts.Node): node is ts.ClassDeclaration {
    return ts.isClassDeclaration(node); //TODO check for @Config decorator
}
