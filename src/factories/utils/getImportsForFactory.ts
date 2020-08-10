import * as ts from 'typescript';
import { getFactoryNameForNamespaceImport } from './getFactoryNameForNamespaceImport';
import { getConfigPathWithoutExtension } from './getConfigPathWithoutExtension';
import { getFactoryDependencies } from './getFactoryDependencies';

export function getImportsForFactory(configId: string): ts.ImportDeclaration[] {
    return getFactoryDependencies(configId).map(({ configId: dependencyFactoryId }) => ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamespaceImport(
                ts.createIdentifier(
                    getFactoryNameForNamespaceImport(dependencyFactoryId),
                ),
            ),
            false
        ),
        ts.createStringLiteral(getConfigPathWithoutExtension(dependencyFactoryId)),
    ));
}
