import ts, { factory } from 'typescript';
import upath from 'upath';
import { PRIVATE_TOKEN } from '../constants';
import { getImportPathToExternalDirectory } from '../utils/getImportPathToExternalDirectory';
import { TContextDescriptorToIdentifier } from '../utils/getGlobalContextIdentifierFromArrayOrCreateNewAndPush';
import { removeExtensionFromPath } from '../../utils/removeExtensionFromPath';

export const INTERNAL_CAT_CONTEXT_IMPORT = `INTERNAL_CAT_CONTEXT_IMPORT${PRIVATE_TOKEN}`;
export const CONTEXT_POOL_IMPORT = `CONTEXT_POOL_IMPORT${PRIVATE_TOKEN}`;

export const addNecessaryImports = (contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[]): ts.TransformerFactory<ts.SourceFile> => {
    return () => sourceFile => {
        const sourceFileDirname = upath.dirname(sourceFile.fileName);
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

        const globalContextImports = contextDescriptorToIdentifierList.map(([contextDescriptor, identifier]) => {
            const relativePathToGlobalContext = `./${upath.relative(
                sourceFileDirname,
                removeExtensionFromPath(contextDescriptor.absolutePath),
            )}`;

            return (
                factory.createImportDeclaration(
                    undefined,
                    undefined,
                    factory.createImportClause(
                        false,
                        undefined,
                        factory.createNamespaceImport(identifier)
                    ),
                    factory.createStringLiteral(relativePathToGlobalContext)
                )
            );
        });

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
