import ts, { factory } from 'typescript';
import upath from 'upath';
import { PRIVATE_TOKEN } from '../constants';
import { getImportPathToExternalDirectory } from '../utils/getImportPathToExternalDirectory';

export const INTERNAL_CAT_CONTEXT_IMPORT = `INTERNAL_CAT_CONTEXT_IMPORT${PRIVATE_TOKEN}`;
export const CONTEXT_POOL_IMPORT = `CONTEXT_POOL_IMPORT${PRIVATE_TOKEN}`;

export const addNecessaryImports = (): ts.TransformerFactory<ts.SourceFile> => {
    return () => sourceFile => {
        const pathForInternalCatContext = upath.join(
            getImportPathToExternalDirectory(),
            'InternalCatContext',
        );
        const pathForContextPool = upath.join(
            getImportPathToExternalDirectory(),
            'ContextPool',
        );

        const internalCatContextImport = factory.createImportDeclaration(
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
