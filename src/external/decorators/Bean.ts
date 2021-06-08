export type TClassConstructor<T> = new (...args: any[]) => T;
export type TBeanScope = 'prototype' | 'singleton';
export interface IBeanConfig {
    scope?: TBeanScope;
    isPublic: boolean;
}

export function Bean<T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
): void;

export function Bean(
    beanConfig: IBeanConfig,
): typeof Bean;

export function Bean<T>(
    classImpl: TClassConstructor<T>,
    beanConfig?: IBeanConfig,
): T;

export function Bean(
    target: any,
    propertyKey: string | symbol,
): void;

export function Bean(): never {
    throw new Error('Trying to use @Bean without configured di-container, or not in context-class');
}
