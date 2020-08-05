import * as ts from 'typescript';
import { flatten } from 'lodash';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { TypeDependencyRepository } from '../types-dependencies-register/TypeDependencyRepository';
import { getFactoryNameForNamespaceImport } from './getFactoryNameForNamespaceImport';
import { getFactoryPathWithoutExtension } from './getFactoryPathWithoutExtension';

export function getImportsForFactory(factoryId: string): ts.ImportDeclaration[] {
    const factoryTypes = TypeRegisterRepository.getTypesByFactoryId(factoryId).map(it => it.id);
    const dependencies = flatten(factoryTypes.map(it => TypeDependencyRepository.getDependencies(it)));

    const requiredTypesFromOtherFactories = dependencies
        .map(it => TypeRegisterRepository.getTypeById(it))
        .filter(it => it.factoryId !== factoryId);

    return requiredTypesFromOtherFactories.map(({ factoryId }) => ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamespaceImport(
                ts.createIdentifier(
                    getFactoryNameForNamespaceImport(factoryId),
                ),
            ),
            false
        ),
        ts.createStringLiteral(getFactoryPathWithoutExtension(factoryId)),
    ));
}
