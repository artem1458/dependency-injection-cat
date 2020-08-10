import { removeExtensionFromPath } from '../../utils/removeExtensionFromPath';
import { getFactoryPath } from './getFactoryPath';

export function getConfigPathWithoutExtension(factoryId: string): string {
    return removeExtensionFromPath(getFactoryPath(factoryId));
}
