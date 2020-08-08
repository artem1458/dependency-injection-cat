import * as ts from 'typescript';
import { INodeSourceDescriptor } from './types';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';
import { PathResolver } from '../paths-resolver/PathResolver';

export function getBaseTypeNameAndPathFromImport(sourceFile: ts.SourceFile, nameToFind: string): INodeSourceDescriptor | undefined {
    const imports = sourceFile.statements.filter(ts.isImportDeclaration);
    let result: INodeSourceDescriptor | undefined = undefined;

    imports.forEach(imp => {
        if (result !== undefined) {
            return;
        }

        const importPath = PathResolver.resolve(sourceFile.fileName, removeQuotesFromString(imp.moduleSpecifier.getText()));
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
