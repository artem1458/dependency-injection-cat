type TBeanScope = 'prototype' | 'singleton';
type TBeanProps = {
    scope?: TBeanScope;
    name?: string;
}

export function Bean<T>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
): void;

export function Bean<T>(
    beanProps: TBeanProps,
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
