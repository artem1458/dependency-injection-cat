import { IRepository } from './IRepository';

export class ModelRepository<TData> implements IRepository<TData> {
    data: TData | null = null;

    clearData(): void {
        this.data = null;
    }

    saveData(data: TData): void {
        this.data = data;
    }
}
