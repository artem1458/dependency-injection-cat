import * as ts from 'typescript';
import { removeQuotesFromString } from './removeQuotesFromString';

const libraryName = 'ts-pring';

export function isImportFromThisLibrary(node: ts.Node): boolean {
    if (ts.isImportDeclaration(node)) {
        return removeQuotesFromString(node.moduleSpecifier.getText()) === libraryName;
    }

    return false;
}
