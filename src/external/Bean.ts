import { ClassConstructor } from './ClassConstructor';

type BeanScope = 'prototype' | 'singleton';

interface BeanConfig {
    scope?: BeanScope;
}

type ConfigurableMethodBean = (beanConfig: BeanConfig) => PropertyDecorator;
type PropertyBean = <T>(clazz: ClassConstructor<T>, beanConfig?: BeanConfig) => T;

type Bean = PropertyDecorator & ConfigurableMethodBean & PropertyBean;
export const Bean: Bean = () => {
    throw new Error('Trying to use @Bean without configured di-container, or not in context-class');
};
