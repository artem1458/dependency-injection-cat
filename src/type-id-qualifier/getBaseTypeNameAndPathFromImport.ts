import * as ts from 'typescript';
import { ITypeNamePath } from './types';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';
import { absolutizePath } from '../utils/absolutizePath';

export function getBaseTypeNameAndPathFromImport(sourceFile: ts.SourceFile, nameToFind: string): ITypeNamePath | undefined {
    const imports = sourceFile.statements.filter(ts.isImportDeclaration);
    let result: ITypeNamePath | undefined;

    for (let i = 0; i < imports.length; i++){
        let imp = imports[i];
        const importPath = absolutizePath(sourceFile.fileName, removeQuotesFromString(imp.moduleSpecifier.getText()));
        if (imp.importClause === undefined) {
            continue;
        }

        if (imp.importClause.name && imp.importClause.name.escapedText === nameToFind) {
            result = {
                name: 'default',
                path: importPath,
            }
            break;
        }

        const namedBindings = imp.importClause.namedBindings;
        if (namedBindings === undefined) {
            continue;
        }

        if (namedBindings.kind === ts.SyntaxKind.NamespaceImport && namedBindings.name.escapedText === nameToFind) {
            result = {
                name: nameToFind,
                path: importPath,
            }
            break;
        }

        if (namedBindings.kind === ts.SyntaxKind.NamedImports) {
            namedBindings.elements.forEach(it => {
                if (it.name.escapedText === nameToFind) { //TODO maybe remove it.propertyName
                    result = {
                        name: nameToFind,
                        path: importPath,
                    }
                }
            });
        }
    }

    return result;
}
