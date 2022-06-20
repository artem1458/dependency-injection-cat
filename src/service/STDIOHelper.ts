export class STDIOHelper {

    static read<T>(buffer: Buffer): T {
        return JSON.parse(buffer.toString().trim());
    }

    static write<T extends object>(data: T): void {
        process.stdout.write(JSON.stringify(data) + '\n');
    }
}
