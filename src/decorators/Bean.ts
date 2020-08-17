export const Bean = <T extends Function>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
): void => {};
