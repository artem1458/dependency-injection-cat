import ts from 'typescript';
import { diConfigRepository } from '../di-config-repository';
import { typeIdQualifier, TypeQualifierError } from '../type-id-qualifier';
import { TypeDependencyRepository } from './TypeDependencyRepository';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { ProgramRepository } from '../program/ProgramRepository';
import { isBean } from '../utils/isBean';
import { getMethodLocationMessage } from '../utils/getMethodLocationMessage';

let initialized = false;

export function registerDependencies(): void {
    if (initialized) {
        return;
    }

    initialized = true;

    const program = ProgramRepository.program;

    diConfigRepository.forEach(filePath => {
        const path = filePath as ts.Path;
        const sourceFile = program.getSourceFileByPath(path);

        if (sourceFile === undefined) {
            throw new Error(`SourceFile not found, path ${path}`);
        }

        travelSourceFile(sourceFile);
    });

    function travelSourceFile(node: ts.Node): void {
        if (isBean(node)) {
            const dependencies: Array<string> = [];

            node.parameters.forEach(parameter => {
                try {
                    const typeId = typeIdQualifier(parameter);
                    TypeRegisterRepository.checkTypeInRegister(typeId);
                    dependencies.push(typeId);
                } catch (error) {
                    switch (error) {
                        case TypeQualifierError.HasNoType:
                            throw new Error('All parameters in Bean should have type' + getMethodLocationMessage(node));

                        case TypeQualifierError.TypeIsPrimitive:
                            throw new Error('All parameters in Bean should have complex return type (interfaces, ...etc)' + getMethodLocationMessage(node));

                        default:
                            throw new Error(error);
                    }
                }
            });

            const beanTypeId = typeIdQualifier(node);
            TypeDependencyRepository.addDependencies(beanTypeId, ...dependencies);
        }

        ts.forEachChild(node, travelSourceFile);
    }
}
