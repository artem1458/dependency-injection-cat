import * as ts from 'typescript';
import { DiConfigRepository } from '../di-config-repository';
import { TypeRegisterRepository } from './TypeRegisterRepository';
import {
    methodBeanTypeIdQualifier,
    TypeQualifierError
} from '../typescript-helpers/type-id-qualifier';
import { ProgramRepository } from '../program/ProgramRepository';
import { isMethodBean } from '../typescript-helpers/decorator-helpers/isMethodBean';
import { getClassMemberLocationMessage } from '../typescript-helpers/getClassMemberLocationMessage';
import { checkTypeForCorrectness } from '../typescript-helpers/type-id-qualifier/common/utils/checkTypeForCorrectness';
import { isBeanDecorator } from '../typescript-helpers/decorator-helpers/isBeanDecorator';
import { getMethodBeanInfo } from '../typescript-helpers/bean-info/getMethodBeanInfo';
import { isClassPropertyBean } from '../typescript-helpers/decorator-helpers/isClassPropertyBean';
import { classPropertyBeanTypeIdQualifier } from '../typescript-helpers/type-id-qualifier/class-property-bean/classPropertyBeanTypeIdQualifier';
import { getPropertyBeanInfo } from '../typescript-helpers/bean-info/getPropertyBeanInfo';

export function registerTypes(): void {
    const program = ProgramRepository.program;

    DiConfigRepository.data.forEach(filePath => {
        const path = filePath as ts.Path;
        const sourceFile = program.getSourceFileByPath(path);

        if (sourceFile === undefined) {
            throw new Error(`SourceFile not found, path ${path}`);
        }

        travelSourceFile(sourceFile, filePath);
    });

    function travelSourceFile(node: ts.Node, configPath: string): void {
        isClassPropertyBean(node);

        if (isMethodBean(node)) {
            try {
                if (!ts.isClassDeclaration(node.parent) || !node.parent.name) {
                    throw new Error('Configs must be a Named Class Declaration' + getClassMemberLocationMessage(node));
                }

                const { typeId, originalTypeName } = methodBeanTypeIdQualifier(node);
                const configName = node.parent.name.getText();
                const beanName = node.name.getText();
                const bean = node.decorators?.find(isBeanDecorator);

                if (bean === undefined) {
                    throw new Error('Bean method should have @Bean decorator (how is it possible?)' + getClassMemberLocationMessage(node));
                }

                const beanInfo = getMethodBeanInfo(bean);

                checkTypeForCorrectness(typeId);
                TypeRegisterRepository.registerType({
                    typeId,
                    originalTypeName,
                    configPath,
                    configName,
                    beanName,
                    beanInfo,
                });
            } catch (error) {
                switch (error) {
                    case TypeQualifierError.TypeIsPrimitive:
                        throw new Error('Bean should have complex return type (interfaces, ...etc)' + getClassMemberLocationMessage(node));

                    case TypeQualifierError.CanNotGenerateType:
                        throw new Error('Can not generate type for' + getClassMemberLocationMessage(node));

                    default:
                        throw error;
                }
            }
        }

        if (isClassPropertyBean(node)) {
            try {
                if (!ts.isClassDeclaration(node.parent) || !node.parent.name) {
                    throw new Error('Configs must be a Named Class Declaration' + getClassMemberLocationMessage(node));
                }

                const { typeId, originalTypeName } = classPropertyBeanTypeIdQualifier(node);
                const configName = node.parent.name.getText();
                const beanName = node.name.getText();
                const beanExpression = node.initializer;

                if (beanExpression === undefined) {
                    throw new Error('Bean property should have @Bean decorator (how is it possible?)' + getClassMemberLocationMessage(node));
                }

                const beanInfo = getPropertyBeanInfo(beanExpression);

                checkTypeForCorrectness(typeId);
                TypeRegisterRepository.registerType({
                    typeId,
                    originalTypeName,
                    configPath,
                    configName,
                    beanName,
                    beanInfo,
                });
            } catch (error) {
                switch (error) {
                    case TypeQualifierError.TypeIsPrimitive:
                        throw new Error('Bean should have complex return type (interfaces, ...etc)' + getClassMemberLocationMessage(node));

                    case TypeQualifierError.CanNotGenerateType:
                        throw new Error('Can not generate type for' + getClassMemberLocationMessage(node));

                    default:
                        throw error;
                }
            }
        }

        ts.forEachChild(node, (node: ts.Node) => travelSourceFile(node, configPath));
    }
}
