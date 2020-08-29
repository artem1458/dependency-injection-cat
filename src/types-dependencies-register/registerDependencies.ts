import * as ts from 'typescript';
import { DiConfigRepository } from '../di-config-repository';
import {
    methodBeanTypeIdQualifier,
    parameterTypeIdQualifier,
    TypeQualifierError
} from '../typescript-helpers/type-id-qualifier';
import { TypeDependencyRepository } from './TypeDependencyRepository';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';
import { ProgramRepository } from '../program/ProgramRepository';
import { isMethodBean } from '../typescript-helpers/decorator-helpers/isMethodBean';
import { getClassMemberLocationMessage } from '../typescript-helpers/getClassMemberLocationMessage';

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
                throw new Error('Bean should have return type' + getClassMemberLocationMessage(node));
            }

            const dependencies: Array<string> = [];

            node.parameters.forEach(parameter => {
                 if (parameter.type === undefined) {
                     throw new Error('All parameters in Bean should have type' + getClassMemberLocationMessage(node));
                 }

                try {
                    const { typeId } = parameterTypeIdQualifier(parameter);
                    TypeRegisterRepository.checkTypeInRegister(typeId);
                    dependencies.push(typeId);
                } catch (error) {
                    switch (error) {
                        case TypeQualifierError.TypeIsPrimitive:
                            throw new Error('All parameters in Bean should have complex return type (interfaces, ...etc)' + getClassMemberLocationMessage(node));

                        default:
                            throw new Error(error);
                    }
                }
            });

            const { typeId: beanTypeId } = methodBeanTypeIdQualifier(node);
            TypeDependencyRepository.addDependencies(beanTypeId, ...dependencies);
        }

        ts.forEachChild(node, travelSourceFile);
    }
}
