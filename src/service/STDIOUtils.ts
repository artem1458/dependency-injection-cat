import { IServiceResponse } from './types/ServiceResponse';

export class STDIOUtils {

    static read<T>(buffer: Buffer): T {
        return JSON.parse(buffer.toString().trim());
    }

    static write<T extends IServiceResponse<any>>(data: T): void {
        process.stdout.write(JSON.stringify(data) + '\n');
    }
}
