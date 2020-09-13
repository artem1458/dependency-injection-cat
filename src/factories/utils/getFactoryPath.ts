import path from 'path';
import { getFactoriesListPath } from './getFactoriesListPath';
import { ConfigIdRepository } from '../ConfigIdRepository';

export function getFactoryPath(factoryId: string): string {
    const ext = ConfigIdRepository.getFactoryExtById(factoryId);
    const factoryFileName = `${factoryId}${ext}`;

    return path.resolve(getFactoriesListPath(), factoryFileName);
}
