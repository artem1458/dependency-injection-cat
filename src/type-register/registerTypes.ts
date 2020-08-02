import * as ts from 'typescript';
import { diConfigRepository } from '../di-config-repository';
import { TypeRegisterRepository } from './TypeRegisterRepository';
import { typeIdQualifier, TypeQualifierError } from '../type-id-qualifier';

let initialized = false;

export function registerTypes(program: ts.Program): void {
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
            try {
                const typeId = typeIdQualifier(typeChecker, node);
                TypeRegisterRepository.registerType(typeId);
            } catch (error) {
                const path = node.getSourceFile().fileName;
                const methodName = node.name.getText();
                const methodLocation = `, Method Name = ${methodName}, Path = ${path}`;

                switch (error) {
                    case TypeQualifierError.HasNoType:
                        throw new Error('Bean should have return type' + methodLocation);

                    case TypeQualifierError.TypeIsPrimitive:
                        throw new Error('Bean should have complex return type (interfaces, ...etc)' + methodLocation);
                }
            }
        }

        ts.forEachChild(node, travelSourceFile);
    }
}
