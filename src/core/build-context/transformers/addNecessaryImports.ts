import ts, { factory } from 'typescript';
import upath from 'upath';
import { uniq } from 'lodash';
import { PRIVATE_TOKEN } from '../constants';
import { getRelativePathToExternalDirectoryFromSourceFile } from '../utils/getRelativePathToExternalDirectoryFromSourceFile';
import { getGlobalContextVariableNameByContextId } from '../utils/getGlobalContextVariableNameByContextId';

export const INTERNAL_CAT_CONTEXT_IMPORT = `INTERNAL_CAT_CONTEXT_IMPORT${PRIVATE_TOKEN}`;
export const CONTEXT_POOL_IMPORT = `CONTEXT_POOL_IMPORT${PRIVATE_TOKEN}`;

export const addNecessaryImports = (globalContextIdsToAdd: string[]): ts.TransformerFactory<ts.SourceFile> => {
    return () => sourceFile => {
        const sourceFileDirname = upath.dirname(sourceFile.fileName);
        const relativePathToEXTERNALDirectory = getRelativePathToExternalDirectoryFromSourceFile(
            sourceFileDirname,
        );
        const pathForInternalCatContext = upath.join(
            relativePathToEXTERNALDirectory,
            'InternalCatContext',
        );
        const pathForContextPool = upath.join(
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

        const globalContextImports = uniq(globalContextIdsToAdd).map(it => (
            factory.createImportDeclaration(
                undefined,
                undefined,
                factory.createImportClause(
                    false,
                    undefined,
                    factory.createNamedImports([factory.createImportSpecifier(
                        undefined,
                        factory.createIdentifier(getGlobalContextVariableNameByContextId(it)),
                    )])
                ),
                factory.createStringLiteral(`./context_${it}`),
            )
        ));

        return ts.factory.updateSourceFile(
            sourceFile,
            [
                internalCatContextImport,
                contextPoolImport,
                ...globalContextImports,
                ...sourceFile.statements,
            ]
        );
    };
};
