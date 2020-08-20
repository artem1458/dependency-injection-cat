export function Qualifier(beanName: string): (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
) => void {
    return (
        target: Object,
        propertyKey: string | symbol,
        parameterIndex: number,
    ) => {}
}
