import * as ts from 'typescript';
import { diConfigRepository } from '../di-config-repository';
import { TypeRegisterRepository } from './TypeRegisterRepository';
import { typeIdQualifier, TypeQualifierError } from '../type-id-qualifier';
import { ProgramRepository } from '../program/ProgramRepository';
import { isBean } from '../utils/is-bean/isBean';
import { getMethodLocationMessage } from '../utils/getMethodLocationMessage';

let initialized = false;

export function registerTypes(): void {
    if (initialized) {
        return;
    }

    initialized = true;

    const program = ProgramRepository.program;
    const typeChecker: ts.TypeChecker = program.getTypeChecker();

    diConfigRepository.forEach(filePath => {
        const path = filePath as ts.Path;
        const sourceFile = program.getSourceFileByPath(path);

        if (sourceFile === undefined) {
            throw new Error(`SourceFile not found, path ${path}`);
        }

        travelSourceFile(sourceFile, filePath);
    });

    function travelSourceFile(node: ts.Node, configPath: string): void {
        if (isBean(node)) {
            try {
                const typeId = typeIdQualifier(typeChecker, node);
                TypeRegisterRepository.registerType(typeId, configPath);
            } catch (error) {
                switch (error) {
                    case TypeQualifierError.HasNoType:
                        throw new Error('Bean should have return type' + getMethodLocationMessage(node));

                    case TypeQualifierError.TypeIsPrimitive:
                        throw new Error('Bean should have complex return type (interfaces, ...etc)' + getMethodLocationMessage(node));
                }
            }
        }

        ts.forEachChild(node, (node: ts.Node) => travelSourceFile(node, configPath));
    }
}
