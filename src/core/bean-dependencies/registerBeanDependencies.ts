import ts from 'typescript';
import { BeanRepository, IBeanDescriptor } from '../bean/BeanRepository';
import { registerMethodBeanDependencies } from './registerMethodBeanDependencies';
import { registerPropertyBeanDependencies } from './registerPropertyBeanDependencies';
import { ClassPropertyArrowFunction, ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { IContextDescriptor } from '../context/ContextRepository';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';
import { registerArrowFunctionBeanDependencies } from './registerArrowFunctionBeanDependencies';
import { CompilationContext } from '../../build-context/CompilationContext';

export const registerBeanDependencies = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
) => {
    BeanDependenciesRepository.clearBeanDependenciesByContextDescriptor(contextDescriptor);
    const beanDescriptorList = BeanRepository.contextIdToBeanDescriptorsMap.get(contextDescriptor.id) ?? [];

    beanDescriptorList.forEach(descriptor => {
        switch (descriptor.beanKind) {
        case 'method':
            registerMethodBeanDependencies(compilationContext, descriptor as IBeanDescriptor<ts.MethodDeclaration>);
            break;

        case 'property':
            registerPropertyBeanDependencies(compilationContext, descriptor as IBeanDescriptor<ClassPropertyDeclarationWithInitializer>);
            break;

        case 'arrowFunction':
            registerArrowFunctionBeanDependencies(compilationContext, descriptor as IBeanDescriptor<ClassPropertyArrowFunction>);
            break;
        }
    });
};
