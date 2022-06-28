import { IServiceResponse } from './types/ServiceResponse';

export class STDIOHelper {

    static read<T>(buffer: Buffer): T {
        return JSON.parse(buffer.toString().trim());
    }

    static write<T extends IServiceResponse<any, unknown>>(data: T): void {
        process.stdout.write(JSON.stringify(data) + '\n');
    }
}
