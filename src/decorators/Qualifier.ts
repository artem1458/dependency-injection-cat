export function Qualifier(beanName: string): (
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
