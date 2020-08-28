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

export function Bean<T>(...args: any[]) {
    if (args.length === 3) {
        return;
    }

    return function (
        target: any,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>,
    ): void {}
}
