export function Qualifier<T extends string>(beanName: T extends '' ? never : T): (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
) => void {
    return (
        target: object,
        propertyKey: string | symbol,
        parameterIndex: number,
    ) => {};
}
