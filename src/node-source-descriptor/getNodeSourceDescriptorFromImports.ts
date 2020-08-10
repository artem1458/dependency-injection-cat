import * as ts from 'typescript';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';
import { PathResolver } from '../paths-resolver/PathResolver';
import { ImportType, INodeSourceDescriptor } from './types';

export function getNodeSourceDescriptorFromImports(sourceFile: ts.SourceFile, nameToFind: string): INodeSourceDescriptor | undefined {
    const imports = sourceFile.statements.filter(ts.isImportDeclaration);
    let result: INodeSourceDescriptor | undefined = undefined;

    imports.forEach(imp => {
        if (result !== undefined) {
            return;
        }

        //Transform to absolute path, only if it's relative or aliased by paths defined in tsConfig.json
        const importPath = PathResolver.resolve(sourceFile.fileName, removeQuotesFromString(imp.moduleSpecifier.getText()));
        if (imp.importClause === undefined) {
            return;
        }

        if (imp.importClause.name?.escapedText === nameToFind) {
            result = {
                name: nameToFind,
                path: importPath,
                importType: ImportType.Default,
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
                importType: ImportType.Namespace,
            }
            return;
        }

        if (namedBindings.kind === ts.SyntaxKind.NamedImports) {
            namedBindings.elements.forEach(it => {
                if (it.name.escapedText === nameToFind) {
                    const name = it.propertyName ? it.propertyName.escapedText.toString() : nameToFind;
                    result = {
                        name,
                        path: importPath,
                        importType: ImportType.Named,
                    }
                }
            });
        }
    })

    return result;
}
