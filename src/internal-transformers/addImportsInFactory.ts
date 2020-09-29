import * as ts from 'typescript';
import { ICreateFactoriesContext } from '../factories/ICreateFactoriesContext';
import { getImportForSingleton } from '../factories/utils/getImportForSingleton';

export const addImportsInFactory = (
    imports: ts.ImportDeclaration[],
    factoriesContext: ICreateFactoriesContext,
): ts.TransformerFactory<ts.SourceFile> =>
    context => sourceFile => {
        const newImports = [...imports];

        if (factoriesContext.hasSingleton) {
            newImports.push(getImportForSingleton());
        }

        return ts.updateSourceFileNode(
            sourceFile,
            [
                ...newImports,
                ...sourceFile.statements,
            ],
        );
    };
