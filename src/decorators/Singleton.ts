export function Singleton<T extends Function>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
): TypedPropertyDescriptor<T> {
    let cached: any | undefined = undefined;

    return {
        get(): any {
            return (...args: any): any => {
                if (cached === undefined) {
                    cached = descriptor.value!(...args);
                }
                return cached;
            }
        }
    }
}
