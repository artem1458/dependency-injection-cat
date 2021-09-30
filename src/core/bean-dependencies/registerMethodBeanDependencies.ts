import ts from 'typescript';
import { IBeanDescriptor } from '../bean/BeanRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getParameterType } from './getParameterType';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';
import { getQualifierValueFromFunctionArgument } from './getQualifierValueFromFunctionArgument';

export const registerMethodBeanDependencies = (descriptor: IBeanDescriptor<ts.MethodDeclaration>) => {
    const parameters = descriptor.node.parameters;

    parameters.forEach(parameter => {
        const qualifier = getQualifierValueFromFunctionArgument(parameter, descriptor.contextDescriptor);
        const qualifiedType = getParameterType(parameter);

        if (qualifiedType === null) {
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
                qualifiedType: qualifiedType,
                parameterName: parameter.name.getText(),
                qualifier,
                qualifiedBean: null
            }
        );
    });
};
