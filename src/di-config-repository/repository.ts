export class DiConfigRepository {
    static data: Array<string> = [];

    static registerConfig(fileName: string): void {
        if (!this.data.includes(fileName)) {
            DiConfigRepository.data.push(fileName);
        }
    }

    static unregisterConfig(fileName: string): void {
        const index = this.data.indexOf(fileName);

        if (index >= 0) {
            DiConfigRepository.data.splice(index, 1);
        }
    }
}
