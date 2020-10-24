/* eslint-disable @typescript-eslint/ban-types */

import { NotEmptyString } from '../NotEmptyString';

export function Qualifier<T extends string>(beanName: NotEmptyString<T>): (
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
