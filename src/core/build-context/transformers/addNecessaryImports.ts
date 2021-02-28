import ts, { factory } from 'typescript';
import upath from 'upath';
import { PRIVATE_TOKEN } from '../constants';
import { getRelativePathToExternalDirectoryFromSourceFile } from '../utils/getRelativePathToExternalDirectoryFromSourceFile';
import { getBuiltContextDirectory } from '../utils/getBuiltContextDirectory';

export const REAL_CAT_CONTEXT_IMPORT = `REAL_CAT_CONTEXT_IMPORT${PRIVATE_TOKEN}`;
export const CONTEXT_POOL_IMPORT = `CONTEXT_POOL_IMPORT${PRIVATE_TOKEN}`;

export const addNecessaryImports = (): ts.TransformerFactory<ts.SourceFile> => {
    return () => sourceFile => {
        const relativePathToEXTERNALDirectory = getRelativePathToExternalDirectoryFromSourceFile(
            getBuiltContextDirectory()
        );
        const pathForRealCatContext = upath.join(
            relativePathToEXTERNALDirectory,
            'RealCatContext',
        );
        const pathForContextPool = upath.join(
            relativePathToEXTERNALDirectory,
            'ContextPool',
        );

        const realCatContextImport = factory.createImportDeclaration(
            undefined,
            undefined,
            factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(
                    factory.createIdentifier(REAL_CAT_CONTEXT_IMPORT)
                )
            ),
            factory.createStringLiteral(pathForRealCatContext)
        );

        const contextPoolImport = factory.createImportDeclaration(
            undefined,
            undefined,
            factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(
                    factory.createIdentifier(CONTEXT_POOL_IMPORT)
                )
            ),
            factory.createStringLiteral(pathForContextPool)
        );

        return ts.factory.updateSourceFile(
            sourceFile,
            [
                realCatContextImport,
                contextPoolImport,
                ...sourceFile.statements,
            ]
        );
    };
};

