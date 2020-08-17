import { uniqId } from '../utils/uniqId';

export class ConfigIdRepository {
    private static factories: Record<string, string | undefined> = {};

    static registerConfig(path: string): void {
        if (ConfigIdRepository.factories[path] === undefined) {
            ConfigIdRepository.factories[path] = uniqId();
        }
    }

    static unregisterConfig(path: string): void {
        if (ConfigIdRepository.factories[path] !== undefined) {
            ConfigIdRepository.factories[path] = undefined;
        }
    }

    static getFactoryId(path: string): string {
        const id = ConfigIdRepository.factories[path];

        if (id === undefined) {
            throw new Error('Trying to access to non-exist factory');
        }

        return id;
    }
}
