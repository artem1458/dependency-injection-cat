import { getFactoryPath } from './getFactoryPath';

export function getFactoryPathWithoutExtension(factoryId: string): string {
    return getFactoryPath(factoryId).slice(0, -3);
}
