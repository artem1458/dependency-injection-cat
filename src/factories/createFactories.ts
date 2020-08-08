import fs from 'fs';
import * as ts from 'typescript';
import { getFactoriesListPath } from './utils/getFactoriesListPath';
import { DiConfigRepository } from '../di-config-repository';
import { ProgramRepository } from '../program/ProgramRepository';
import { FactoryIdRepository } from './FactoryIdRepository';
import { getFactoryPath } from './utils/getFactoryPath';
import { absolutizeImports } from '../internal-transformers/absolutizeImports';
import { makeFactorySingleton } from '../internal-transformers/makeFactorySingleton';
import { getImportsForFactory } from './utils/getImportsForFactory';
import { addImportsInFactory } from '../internal-transformers/addImportsInFactory';
import { replaceParametersWithConstants } from '../internal-transformers/replaceParametersWithConstants';
import { ShouldReinitializeRepository } from '../transformer/ShouldReinitializeRepository';

export function createFactories(): void {
    if (!ShouldReinitializeRepository.value) {
        return;
    }

    fs.rmdirSync(getFactoriesListPath(), { recursive: true });
    fs.mkdirSync(getFactoriesListPath());

    const program = ProgramRepository.program;
    const printer = ts.createPrinter();

    DiConfigRepository.data.forEach(filePath => {
        const path = filePath as ts.Path;
        const sourceFile = program.getSourceFileByPath(path);

        if (sourceFile === undefined) {
            throw new Error(`SourceFile not found, path ${path}`);
        }

        const factoryId = FactoryIdRepository.getFactoryId(filePath);
        const imports = getImportsForFactory(factoryId);

        const newSourceFile = ts.transform(sourceFile, [
            absolutizeImports(filePath),
            makeFactorySingleton,
            addImportsInFactory(imports),
            replaceParametersWithConstants(factoryId)
        ]);

        fs.writeFileSync(getFactoryPath(factoryId), printer.printFile(newSourceFile.transformed[0]));
    });
}
