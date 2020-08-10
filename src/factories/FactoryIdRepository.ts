import { uniqId } from '../utils/uniqId';

export class FactoryIdRepository {
    private static factories: Record<string, string | undefined> = {};

    static registerFactory(path: string): void {
        if (FactoryIdRepository.factories[path] === undefined) {
            FactoryIdRepository.factories[path] = uniqId();
        }
    }

    static getFactoryId(path: string): string {
        const id = FactoryIdRepository.factories[path];

        if (id === undefined) {
            throw new Error('Trying to access to non-exist factory');
        }

        return id;
    }
}
