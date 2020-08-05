import path from 'path';
import { getFactoriesListPath } from './getFactoriesListPath';

export function getFactoryPath(factoryId: string): string {
    const factoryFileName = `${factoryId}.ts`;

    return path.resolve(getFactoriesListPath(), factoryFileName);
}
