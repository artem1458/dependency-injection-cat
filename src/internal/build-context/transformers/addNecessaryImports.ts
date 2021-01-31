import ts, { factory } from 'typescript';
import path from 'path';
import { PRIVATE_TOKEN } from '../constants';
import { getRelativePathToExternalDirectoryFromSourceFile } from '../utils/getRelativePathToExternalDirectoryFromSourceFile';
import { getBuildedContextDirectory } from '../utils/getBuildedContextDirectory';

export const INTERNAL_CAT_CONTEXT_IMPORT = `INTERNAL_CAT_CONTEXT_IMPORT${PRIVATE_TOKEN}`;
export const CONTEXT_POOL_IMPORT = `CONTEXT_POOL_IMPORT${PRIVATE_TOKEN}`;

export const addNecessaryImports = (): ts.TransformerFactory<ts.SourceFile> => {
    return () => sourceFile => {
        const relativePathToEXTERNALDirectory = getRelativePathToExternalDirectoryFromSourceFile(
            getBuildedContextDirectory()
        );
        const pathForInternalCatContext = path.join(
            relativePathToEXTERNALDirectory,
            'InternalCatContext',
        );
        const pathForContextPool = path.join(
            relativePathToEXTERNALDirectory,
            'ContextPool',
        );

        const internalCatContextImport = factory.createImportDeclaration(
            undefined,
            undefined,
            factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(
                    factory.createIdentifier(INTERNAL_CAT_CONTEXT_IMPORT)
                )
            ),
            factory.createStringLiteral(pathForInternalCatContext)
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
                internalCatContextImport,
                contextPoolImport,
                ...sourceFile.statements,
            ]
        );
    };
};

