export function Qualifier<T extends string>(beanName: T extends '' ? never : T): (
    targetClass: object,
    parameterKey: string | symbol,
    parameterIndex: number,
) => void {
    return () => {};
}
