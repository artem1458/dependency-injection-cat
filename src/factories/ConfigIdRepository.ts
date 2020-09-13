import { uniqId } from '../utils/uniqId';
import { find } from 'lodash';
import nodePath from 'path';

export class ConfigIdRepository {
    private static factories: Record<string, { id: string; ext: string; } | undefined> = {};

    static registerConfig(path: string): void {
        if (ConfigIdRepository.factories[path] === undefined) {
            const id = uniqId();
            const ext = nodePath.extname(path);

            ConfigIdRepository.factories[path] = {
                id,
                ext,
            };
        }
    }

    static unregisterConfig(path: string): void {
        if (ConfigIdRepository.factories[path] !== undefined) {
            ConfigIdRepository.factories[path] = undefined;
        }
    }

    static getFactoryId(path: string): string {
        const factory = ConfigIdRepository.factories[path];

        if (factory === undefined) {
            throw new Error('Trying to access to non-exist factory');
        }

        return factory.id;
    }

    static getFactoryExtById(id: string): string {
        const factory = find(ConfigIdRepository.factories, (value) => value?.id === id);

        if (factory === undefined) {
            throw new Error('Trying to access to non-exist factory');
        }

        return factory.ext;
    }
}
