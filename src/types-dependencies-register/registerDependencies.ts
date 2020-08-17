import ts from 'typescript';
import { DiConfigRepository } from '../di-config-repository';
import { typeIdQualifier, TypeQualifierError } from '../typescript-helpers/type-id-qualifier';
import { TypeDependencyRepository } from './TypeDependencyRepository';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { ProgramRepository } from '../program/ProgramRepository';
import { isMethodBean } from '../typescript-helpers/bean/isMethodBean';
import { getMethodLocationMessage } from '../typescript-helpers/getMethodLocationMessage';

export function registerDependencies(): void {
    const program = ProgramRepository.program;

    DiConfigRepository.data.forEach(filePath => {
        const path = filePath as ts.Path;
        const sourceFile = program.getSourceFileByPath(path);

        if (sourceFile === undefined) {
            throw new Error(`SourceFile not found, path ${path}`);
        }

        travelSourceFile(sourceFile);
    });

    function travelSourceFile(node: ts.Node): void {
        if (isMethodBean(node)) {
            if (node.type === undefined) {
                throw new Error('Bean should have return type' + getMethodLocationMessage(node));
            }

            const dependencies: Array<string> = [];

            node.parameters.forEach(parameter => {
                 if (parameter.type === undefined) {
                     throw new Error('All parameters in Bean should have type' + getMethodLocationMessage(node));
                 }

                try {
                    const { typeId } = typeIdQualifier(parameter.type);
                    TypeRegisterRepository.checkTypeInRegister(typeId);
                    dependencies.push(typeId);
                } catch (error) {
                    switch (error) {
                        case TypeQualifierError.TypeIsPrimitive:
                            throw new Error('All parameters in Bean should have complex return type (interfaces, ...etc)' + getMethodLocationMessage(node));

                        default:
                            throw new Error(error);
                    }
                }
            });

            const { typeId: beanTypeId } = typeIdQualifier(node.type);
            TypeDependencyRepository.addDependencies(beanTypeId, ...dependencies);
        }

        ts.forEachChild(node, travelSourceFile);
    }
}
