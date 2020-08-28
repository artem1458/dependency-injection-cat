import * as ts from 'typescript';
import { getPrivateIdentifier } from '../../typescript-helpers/getPrivateIdentifier';
import { libraryName } from '../../constants/libraryName';

export function getImportForSingleton(): ts.ImportDeclaration {
    return ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamedImports([ts.createImportSpecifier(
                ts.createIdentifier('Singleton'),
                getPrivateIdentifier('Singleton'),
            )]),
            false
        ),
        ts.createStringLiteral(libraryName),
    );
}
