import ts from 'typescript';
import { BeanRepository, IBeanDescriptor } from '../bean/BeanRepository';
import { registerMethodBeanDependencies } from './registerMethodBeanDependencies';
import { registerPropertyBeanDependencies } from './registerPropertyBeanDependencies';
import { ClassPropertyArrowFunction, ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { IContextDescriptor } from '../context/ContextRepository';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';
import { registerArrowFunctionBeanDependencies } from './registerArrowFunctionBeanDependencies';

export const registerBeanDependencies = (contextDescriptor: IContextDescriptor) => {
    BeanDependenciesRepository.clearBeanDependenciesByContextDescriptor(contextDescriptor);
    const beanDescriptorList = BeanRepository.contextIdToBeanDescriptorsMap.get(contextDescriptor.id) ?? [];

    beanDescriptorList.forEach(descriptor => {
        switch (descriptor.beanKind) {
        case 'method':
            registerMethodBeanDependencies(descriptor as IBeanDescriptor<ts.MethodDeclaration>);
            break;

        case 'property':
            registerPropertyBeanDependencies(descriptor as IBeanDescriptor<ClassPropertyDeclarationWithInitializer>);
            break;

        case 'arrowFunction':
            registerArrowFunctionBeanDependencies(descriptor as IBeanDescriptor<ClassPropertyArrowFunction>);
            break;
        }
    });
};
