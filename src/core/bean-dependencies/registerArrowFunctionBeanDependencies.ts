import { IBeanDescriptor } from '../bean/BeanRepository';
import { getParameterType } from './getParameterType';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import { getQualifierValueFromFunctionArgument } from './getQualifierValueFromFunctionArgument';
import { ExtendedSet } from '../utils/ExtendedSet';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { TypeQualifyError } from '../../exceptions/compilation/errors/TypeQualifyError';

export const registerArrowFunctionBeanDependencies = (
    compilationContext: CompilationContext,
    descriptor: IBeanDescriptor<ClassPropertyArrowFunction>
) => {
    const parameters = descriptor.node.initializer.parameters;

    parameters.forEach(parameter => {
        const qualifier = getQualifierValueFromFunctionArgument(compilationContext, parameter, descriptor.contextDescriptor);
        const qualifiedType = getParameterType(compilationContext, descriptor.contextDescriptor, parameter);

        if (qualifiedType === null) {
            compilationContext.report(new TypeQualifyError(
                null,
                parameter,
                descriptor.contextDescriptor.node,
            ));
            return;
        }

        BeanDependenciesRepository.registerBeanDependency(
            descriptor,
            {
                node: parameter,
                contextName: descriptor.contextDescriptor.name,
                qualifiedType: qualifiedType,
                parameterName: parameter.name.getText(),
                qualifier,
                qualifiedBeans: new ExtendedSet()
            }
        );
    });
};


