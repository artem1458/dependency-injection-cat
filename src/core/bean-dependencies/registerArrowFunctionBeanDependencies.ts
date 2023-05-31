import { IBeanDescriptor } from '../bean/BeanRepository';
import { getParameterType } from './getParameterType';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import { ExtendedSet } from '../utils/ExtendedSet';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { TypeQualifyError } from '../../compilation-context/messages/errors/TypeQualifyError';

export const registerArrowFunctionBeanDependencies = (
    compilationContext: CompilationContext,
    descriptor: IBeanDescriptor<ClassPropertyArrowFunction>
) => {
    const parameters = descriptor.node.initializer.parameters;

    parameters.forEach(parameter => {
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
                qualifier: null,
                qualifiedType: qualifiedType,
                parameterName: parameter.name.getText(),
                qualifiedBeans: new ExtendedSet()
            }
        );
    });
};


