import * as ts from 'typescript';
import path from 'path';
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
import { classPropertyBeanTypeIdQualifier } from '../typescript-helpers/type-id-qualifier/class-property-bean/classPropertyBeanTypeIdQualifier';
import { IClassPropertyDeclarationWithInitializer } from '../typescript-helpers/type-id-qualifier/common/types';
import { getNodeSourceDescriptorDeep } from '../typescript-helpers/node-source-descriptor/getNodeSourceDescriptorDeep';
import { SourceFilesCache } from '../typescript-helpers/node-source-descriptor/SourceFilesCache';

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

const restrictedExtentions = [
    '.js',
    '.jsx',
];

function getClassDependencies(node: IClassPropertyDeclarationWithInitializer): Array<string> {
    const nameToFind  = node.initializer.arguments[0].getText();
    const sourceFile = node.getSourceFile();
    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(sourceFile, nameToFind);

    if (nodeSourceDescriptor === null) {
        throw new Error('Can not find import for bean implementation' + getClassMemberLocationMessage(node));
    }

    if (restrictedExtentions.includes(path.extname(nodeSourceDescriptor.path))) {
        throw new Error('Can not use bean implementation from js or jsx files' + getClassMemberLocationMessage(node));
    }

    const file = SourceFilesCache.getSourceFileByPath(nodeSourceDescriptor.path);

    const dependencies: Array<string> = [];

    const classDeclaration = file.statements.find((it): it is ts.ClassDeclaration => {
        if (!ts.isClassDeclaration(it)) {
            return false;
        }

        if (it.name && it.name.escapedText.toString() === nodeSourceDescriptor.name) {
            return true;
        }

        return false;
    });

    if (classDeclaration === undefined) {
        throw new Error(`Can not find class declaration for ${nodeSourceDescriptor.name} in file ${nodeSourceDescriptor.path}`);
    }

    const constructor = classDeclaration.members.find(ts.isConstructorDeclaration);

    if (constructor === undefined) {
        return [];
    }

    constructor.parameters.forEach(parameter => {
        if (parameter.type === undefined) {
            throw new Error(`All parameters in Class declaration that you are use in Bean property should have a type, ${nodeSourceDescriptor.name} file ${nodeSourceDescriptor.path}`);
        }

        try {
            const { typeId } = parameterTypeIdQualifier(parameter);
            TypeRegisterRepository.checkTypeInRegister(typeId);
            dependencies.push(typeId);
        } catch (error) {
            switch (error) {
            case TypeQualifierError.TypeIsPrimitive:
                throw new Error('All parameters in Bean should have complex return type (interfaces, ...etc)' + getClassMemberLocationMessage(constructor));

            default:
                throw error;
            }
        }
    });

    return dependencies;
}
