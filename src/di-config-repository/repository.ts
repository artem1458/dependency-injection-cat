export class DiConfigRepository {
    static data: Array<string> = [];

    static registerConfig(fileName: string): void {
        DiConfigRepository.data.push(fileName);
    }

    static clearRepository(): void {
        DiConfigRepository.data = [];
    }
}
