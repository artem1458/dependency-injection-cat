import fs from 'fs';
import * as ts from 'typescript';
import { DiConfigRepository } from '../di-config-repository';
import { ProgramRepository } from '../program/ProgramRepository';
import { ConfigIdRepository } from './ConfigIdRepository';
import { getFactoryPath } from './utils/getFactoryPath';
import { absolutizeImports } from '../internal-transformers/absolutizeImports';
import { makeFactorySingleton } from '../internal-transformers/makeFactorySingleton';
import { getImportsForFactory } from './utils/getImportsForFactory';
import { addImportsInFactory } from '../internal-transformers/addImportsInFactory';
import { replaceParametersWithConstants } from '../internal-transformers/replaceParametersWithConstants';
import { setMethodBeanScopesAndRemoveBeanDecorators } from '../internal-transformers/setMethodBeanScopesAndRemoveBeanDecorators';
import { ICreateFactoriesContext } from './ICreateFactoriesContext';
import { replaceClassPropertyBean } from '../internal-transformers/replaceClassPropertyBean';
import { checkForContainerGetCall } from '../internal-transformers/checkForContainerGetCall';

export function createFactories(): void {
    const program = ProgramRepository.program;
    const typeChecker = program.getTypeChecker();
    const printer = ts.createPrinter();

    DiConfigRepository.data.forEach(filePath => {
        const context: ICreateFactoriesContext = {
            hasSingleton: false,
        };

        const path = filePath as ts.Path;
        const sourceFile = program.getSourceFileByPath(path);

        if (sourceFile === undefined) {
            throw new Error(`SourceFile not found, path ${path}`);
        }

        const factoryId = ConfigIdRepository.getFactoryId(filePath);
        const imports = getImportsForFactory(factoryId);

        const newSourceFile = ts.transform(sourceFile, [
            checkForContainerGetCall(typeChecker),
            absolutizeImports(filePath),
            makeFactorySingleton,
            replaceParametersWithConstants(factoryId),
            setMethodBeanScopesAndRemoveBeanDecorators(context),
            replaceClassPropertyBean(factoryId, context),
            addImportsInFactory(imports, context),
        ]);

        fs.writeFile(getFactoryPath(factoryId), printer.printFile(newSourceFile.transformed[0]), (err) => {
            if (err !== null) {
                throw err;
            }
        });
    });
}
