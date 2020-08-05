import { uuid } from '../utils/uuid';

export class FactoryIdRepository {
    private static _factories: Record<string, string | undefined> = {};

    static registerFactory(path: string): void {
        if (FactoryIdRepository._factories[path] !== undefined) {
            throw new Error('Trying to register same factory');
        }

        FactoryIdRepository._factories[path] = uuid();
    }

    static getFactoryId(path: string): string {
        const id = FactoryIdRepository._factories[path];

        if(id === undefined) {
            throw new Error('Trying to access to non-exist factory');
        }

        return id;
    }
}
