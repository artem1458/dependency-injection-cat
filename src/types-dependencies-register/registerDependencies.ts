import ts from 'typescript';
import { diConfigRepository } from '../di-config-repository';
import { typeIdQualifier, TypeQualifierError } from '../type-id-qualifier';
import { TypeDependencyRepository } from './TypeDependencyRepository';
import { TypeRegisterRepository } from '../type-register/TypeRegisterRepository';

let initialized = false;

export function registerDependencies(program: ts.Program): void {
    if (initialized) {
        return;
    }

    initialized = true;

    const typeChecker: ts.TypeChecker = program.getTypeChecker();

    diConfigRepository.forEach(filePath => {
        const path = filePath as ts.Path;
        const sourceFile = program.getSourceFileByPath(path);

        if (sourceFile === undefined) {
            throw new Error(`SourceFile not found, path ${path}`);
        }

        travelSourceFile(sourceFile);
    });

    function travelSourceFile(node: ts.Node): void {
        if (ts.isMethodDeclaration(node)) {
            const dependencies: Array<string> = [];

            node.parameters.forEach(parameter => {
                try {
                    const typeId = typeIdQualifier(typeChecker, parameter);
                    TypeRegisterRepository.checkTypeInRegister(typeId);
                    dependencies.push(typeId);
                } catch (error) {
                    const path = node.getSourceFile().fileName;
                    const methodName = node.name.getText();
                    const methodLocation = `, Method Name = ${methodName}, Path = ${path}`;

                    switch (error) {
                        case TypeQualifierError.HasNoType:
                            throw new Error('All parameters in Bean should have type' + methodLocation);

                        case TypeQualifierError.TypeIsPrimitive:
                            throw new Error('All parameters in Bean should have complex return type (interfaces, ...etc)' + methodLocation);

                        default:
                            throw new Error(error);
                    }
                }
            });

            const beanTypeId = typeIdQualifier(typeChecker, node);
            TypeDependencyRepository.addDependencies(beanTypeId, ...dependencies);
        }

        ts.forEachChild(node, travelSourceFile);
    }
}
