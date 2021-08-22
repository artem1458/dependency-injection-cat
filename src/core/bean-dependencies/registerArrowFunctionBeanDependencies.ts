import { IBeanDescriptor } from '../bean/BeanRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getParameterType } from './getParameterType';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import { getQualifierValueFromFunctionArgument } from './getQualifierValueFromFunctionArgument';

export const registerArrowFunctionBeanDependencies = (descriptor: IBeanDescriptor<ClassPropertyArrowFunction>) => {
    const parameters = descriptor.node.initializer.parameters;

    parameters.forEach(parameter => {
        const qualifier = getQualifierValueFromFunctionArgument(parameter, descriptor.contextDescriptor);
        const type = getParameterType(parameter);

        if (type === null) {
            CompilationContext.reportError({
                node: parameter,
                message: 'Can\'t qualify type of Bean parameter',
                filePath: descriptor.contextDescriptor.absolutePath,
                relatedContextPath: descriptor.contextDescriptor.absolutePath,
            });
            return;
        }

        BeanDependenciesRepository.registerBeanDependency(
            descriptor,
            {
                node: parameter,
                contextName: descriptor.contextDescriptor.name,
                originalTypeName: type.originalTypeName,
                type: type.typeId,
                parameterName: parameter.name.getText(),
                qualifier,
                qualifiedBean: null
            }
        );
    });
};


