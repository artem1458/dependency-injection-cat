import * as ts from 'typescript';
import { DiConfigRepository } from '../di-config-repository';
import { TypeRegisterRepository } from './TypeRegisterRepository';
import {
    methodBeanTypeIdQualifier,
    TypeQualifierError
} from '../typescript-helpers/type-id-qualifier';
import { ProgramRepository } from '../program/ProgramRepository';
import { isMethodBean } from '../typescript-helpers/decorator-helpers/isMethodBean';
import { getMethodLocationMessage } from '../typescript-helpers/getMethodLocationMessage';
import { checkTypeForCorrectness } from '../typescript-helpers/type-id-qualifier/common/utils/checkTypeForCorrectness';
import { isBeanDecorator } from '../typescript-helpers/decorator-helpers/isBeanDecorator';
import { getMethodBeanInfo } from '../typescript-helpers/bean-info/getMethodBeanInfo';

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
        if (isMethodBean(node)) {
            if (node.type === undefined) {
                throw new Error('Bean should have return type' + getMethodLocationMessage(node));
            }

            try {
                if (!ts.isClassDeclaration(node.parent) || !node.parent.name) {
                    throw new Error('Configs must be a Named Class Declaration' + getMethodLocationMessage(node));
                }

                const { typeId, originalTypeName } = methodBeanTypeIdQualifier(node);
                const configName = node.parent.name.getText();
                const beanName = node.name.getText();
                const bean = node.decorators?.find(isBeanDecorator);

                if (bean === undefined) {
                    throw new Error('Bean method should have @Bean decorator (how is it possible?)' + getMethodLocationMessage(node));
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
                        throw new Error('Bean should have complex return type (interfaces, ...etc)' + getMethodLocationMessage(node));

                    case TypeQualifierError.CanNotGenerateType:
                        throw new Error('Can not generate type for' + getMethodLocationMessage(node));

                    default:
                        throw new Error(error);
                }
            }
        }

        ts.forEachChild(node, (node: ts.Node) => travelSourceFile(node, configPath));
    }
}
