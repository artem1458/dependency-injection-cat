import ts from 'typescript';
import { IBeanDescriptor } from '../bean/BeanRepository';
import { getParameterType } from './getParameterType';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';
import { ExtendedSet } from '../utils/ExtendedSet';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { TypeQualifyError } from '../../compilation-context/messages/errors/TypeQualifyError';

export const registerMethodBeanDependencies = (
    compilationContext: CompilationContext,
    descriptor: IBeanDescriptor<ts.MethodDeclaration>
) => {
    const parameters = descriptor.node.parameters;

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
