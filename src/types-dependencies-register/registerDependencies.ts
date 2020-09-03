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
import { isClassPropertyBean } from '../typescript-helpers/decorator-helpers/isClassPropertyBean';
import { getPropertyBeanInfo } from '../typescript-helpers/bean-info/getPropertyBeanInfo';
import { classPropertyBeanTypeIdQualifier } from '../typescript-helpers/type-id-qualifier/class-property-bean/classPropertyBeanTypeIdQualifier';
import { IClassPropertyDeclarationWithInitializer } from '../typescript-helpers/type-id-qualifier/common/types';
import { getNodeSourceDescriptorFromImports } from '../typescript-helpers/node-source-descriptor';
import { createProgram } from 'typescript';
import { CompilerOptionsProvider } from '../compiler-options-provider/CompilerOptionsProvider';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';

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

        if (isClassPropertyBean(node)) {
            const dependencies = getClassDependencies(node);

            const { typeId: beanTypeId } = classPropertyBeanTypeIdQualifier(node);
            TypeDependencyRepository.addDependencies(beanTypeId, ...dependencies);
        }

        ts.forEachChild(node, travelSourceFile);
    }
}

function getClassDependencies(node: IClassPropertyDeclarationWithInitializer): Array<string> {
    const nameToFind  = node.initializer.arguments[0].getText();
    const importSourceDescriptor = getNodeSourceDescriptorFromImports(node.getSourceFile(), nameToFind);

    if (importSourceDescriptor === undefined) {
        throw new Error('Can not find import for bean implementation' + getClassMemberLocationMessage(node));
    }

    const program = createProgram([importSourceDescriptor.path], CompilerOptionsProvider.options);
    const file = program.getSourceFile(importSourceDescriptor.path);

    if (file === undefined) {
        throw new Error(`File not found in program, ${importSourceDescriptor.path}`);
    }

    let dependencies: Array<string> = [];

    const classDeclaration = file.statements.find((it): it is ts.ClassDeclaration => {
        if (!ts.isClassDeclaration(it)) {
            return false;
        }

        if (it.name && it.name.escapedText.toString() === importSourceDescriptor.name) {
            return true;
        }

        return false;
    });

    if (classDeclaration === undefined) {
        throw new Error(`Can not find class declaration for ${importSourceDescriptor.name} in file ${importSourceDescriptor.path}`);
    }

    const constructor = classDeclaration.members.find(ts.isConstructorDeclaration);

    if (constructor === undefined) {
        return [];
    }

    constructor.parameters.forEach(parameter => {
        if (parameter.type === undefined) {
            throw new Error(`All parameters in Class declaration that you are use in Bean property should have a type, ${importSourceDescriptor.name} file ${importSourceDescriptor.path}`);
        }

        try {
            const { typeId } = parameterTypeIdQualifier(parameter);
            TypeRegisterRepository.checkTypeInRegister(typeId);
            dependencies.push(typeId);
        } catch (error) {
            switch (error) {
                case TypeQualifierError.TypeIsPrimitive:
                    throw new Error('All parameters in Bean should have complex return type (interfaces, ...etc)' + getClassMemberLocationMessage(classConstructor));

                default:
                    throw error;
            }
        }
    });

    return dependencies;
}
