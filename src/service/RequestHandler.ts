import { ResponseStatus, ServiceResponse } from './types/ServiceResponse';
import { STDIOHelper } from './STDIOHelper';
import { ServiceRequest } from './types/ServiceRequest';

export class RequestHandler {
    static init(): void {
        process.stdin.on('data', this.onStdIn);
    }

    static onStdIn(buffer: Buffer): void {
        try {
            const data: ServiceRequest = STDIOHelper.read(buffer);

            console.log(data);
        } catch (err) {
            const response: ServiceResponse = {
                status: ResponseStatus.NOT_OK,
            };

            STDIOHelper.write(response);
        }
    }
}
