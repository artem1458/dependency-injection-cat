export type TClassConstructor<T> = new (...args: any[]) => T;
export type TBeanScope = 'prototype' | 'singleton';
export interface IBeanInfo {
    scope?: TBeanScope;
    qualifier?: string;
}

export function Bean<T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
): void;

export function Bean<T>(
    beanProps: IBeanInfo,
): typeof Bean;

export function Bean<T>(
    classIml: TClassConstructor<T>,
    beanProps?: IBeanInfo,
): T;

export function Bean<T>(
    target: any,
    propertyKey: string | symbol,
): void;

export function Bean<T>(...args: any[]) {
    throw new Error('Trying to use Bean property without configured di-container, or not in class');

    return function (
        target: any,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>,
    ): void {}
}
