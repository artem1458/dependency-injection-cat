import ts, { factory } from 'typescript';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';
import { libraryName } from '../../constants/libraryName';
//TODO remove all file
export const removeDIImports = (): ts.TransformerFactory<ts.SourceFile> => {
    return () => {
        return sourceFile => {
            const newStatements = removeDIImportsFromStatements(sourceFile.statements);

            return factory.updateSourceFile(
                sourceFile,
                newStatements,
            );
        };
    };
};

export function removeDIImportsFromStatements(statements: ts.NodeArray<ts.Statement>): ts.Statement[] {
    return statements.filter(statement => {
        if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
            return removeQuotesFromString(statement.moduleSpecifier.text) !== libraryName;
        }

        return true;
    });
}
