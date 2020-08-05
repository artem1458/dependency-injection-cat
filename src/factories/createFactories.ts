import fs from 'fs';
import * as ts from 'typescript';
import { ScriptTarget } from 'typescript';
import { getFactoriesListPath } from './getFactoriesListPath';
import { diConfigRepository } from '../di-config-repository';
import { ProgramRepository } from '../program/ProgramRepository';
import { FactoryIdRepository } from './FactoryIdRepository';
import { getFactoryPath } from './getFactoryPath';
import { isBean } from '../utils/is-bean/isBean';
import { getMethodLocationMessage } from '../utils/getMethodLocationMessage';

let initialized = false;

export function createFactories(): void {
    if (initialized) {
        return;
    }

    initialized = true;
    fs.rmdirSync(getFactoriesListPath(), { recursive: true });
    fs.mkdirSync(getFactoriesListPath());

    const program = ProgramRepository.program;
    const typeChecker: ts.TypeChecker = program.getTypeChecker();
    const printer = ts.createPrinter();

    diConfigRepository.forEach(filePath => {
        const path = filePath as ts.Path;
        const sourceFile = program.getSourceFileByPath(path);

        if (sourceFile === undefined) {
            throw new Error(`SourceFile not found, path ${path}`);
        }

        const factoryId = FactoryIdRepository.getFactoryId(filePath);
        const newSourceFile = ts.createSourceFile('', '', ScriptTarget.ES2015);

        createSourceFile(sourceFile);

        fs.writeFileSync(getFactoryPath(factoryId), printer.printFile(newSourceFile));
    });

    function createSourceFile(node: ts.Node): void {
        if (isBean(node)) {
            const body = node.body;

            if (body === undefined) {
                throw new Error('Body of bean should not be empty' + getMethodLocationMessage(node));
            }

            let returnStatement: ts.ReturnStatement | undefined;

            body.statements.forEach(it => {
                if (ts.isReturnStatement(it)) {
                    returnStatement = it;
                }
            });

            if (returnStatement === undefined || returnStatement.expression === undefined) {
                throw new Error('Return statement in bean not found or its empty' + getMethodLocationMessage(node));
            }

            returnStatement.expression.forEachChild(node1 => {
                const a = typeChecker.getSymbolAtLocation(node1);
                console.log(a);
            })
        }

        ts.forEachChild(node, (node: ts.Node) => createSourceFile(node));
    }
}
