import ts from 'typescript';
import { BeanRepository, IBeanDescriptor } from '../bean/BeanRepository';
import { isMethodBean } from '../ts-helpers/predicates/isMethodBean';
import { registerMethodBeanDependencies } from './registerMethodBeanDependencies';
import { isClassPropertyBean } from '../ts-helpers/predicates/isClassPropertyBean';
import { registerPropertyBeanDependencies } from './registerPropertyBeanDependencies';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';

export const registerBeanDependencies = () => {
    BeanRepository.beanDescriptorRepository.forEach((beanTypeMap) => {
        beanTypeMap.forEach((beanDescriptorList) => {
            beanDescriptorList.forEach(descriptor => {
                if (isMethodBean(descriptor.node)) {
                    registerMethodBeanDependencies(descriptor as IBeanDescriptor<ts.MethodDeclaration>);
                }
                if (isClassPropertyBean(descriptor.node)) {
                    registerPropertyBeanDependencies(descriptor as IBeanDescriptor<ClassPropertyDeclarationWithInitializer>);
                }
            });
        });
    });
};
