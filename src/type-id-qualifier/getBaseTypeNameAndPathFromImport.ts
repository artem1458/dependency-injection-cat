import * as ts from 'typescript';
import { ITypeNamePath } from './types';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';
import { absolutizePath } from '../utils/absolutizePath';

export function getBaseTypeNameAndPathFromImport(sourceFile: ts.SourceFile, nameToFind: string): ITypeNamePath | undefined {
    const imports = sourceFile.statements.filter(ts.isImportDeclaration);
    let result: ITypeNamePath | undefined = undefined;

    imports.forEach(imp => {
        if (result !== undefined) {
            return;
        }

        const importPath = absolutizePath(sourceFile.fileName, removeQuotesFromString(imp.moduleSpecifier.getText()));
        if (imp.importClause === undefined) {
            return;
        }

        if (imp.importClause.name && imp.importClause.name.escapedText === nameToFind) {
            result = {
                name: 'default',
                path: importPath,
                isDefault: true,
            }
            return;
        }

        const namedBindings = imp.importClause.namedBindings;
        if (namedBindings === undefined) {
            return;
        }

        if (namedBindings.kind === ts.SyntaxKind.NamespaceImport && namedBindings.name.escapedText === nameToFind) {
            result = {
                name: nameToFind,
                path: importPath,
            }
            return;
        }

        if (namedBindings.kind === ts.SyntaxKind.NamedImports) {
            namedBindings.elements.forEach(it => {
                if (it.name.escapedText === nameToFind) {
                    result = {
                        name: nameToFind,
                        path: importPath,
                    }
                }
            });
        }
    })

    return result;
}
