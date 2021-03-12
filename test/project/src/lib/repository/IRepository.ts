export interface IRepository<TData> {
    data: TData | null;

    saveData(data: TData): void;
    clearData(): void;
}
