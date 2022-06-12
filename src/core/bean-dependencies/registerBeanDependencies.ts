import ts from 'typescript';
import { BeanRepository, IBeanDescriptor } from '../bean/BeanRepository';
import { registerMethodBeanDependencies } from './registerMethodBeanDependencies';
import { registerPropertyBeanDependencies } from './registerPropertyBeanDependencies';
import { ClassPropertyArrowFunction, ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { IContextDescriptor } from '../context/ContextRepository';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';
import { registerArrowFunctionBeanDependencies } from './registerArrowFunctionBeanDependencies';
import { CompilationContext2 } from '../../compilation-context/CompilationContext2';

export const registerBeanDependencies = (
    compilationContext: CompilationContext2,
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
