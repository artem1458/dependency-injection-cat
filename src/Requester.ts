import { IRequester } from '@src/IRequester';
import { ILogger } from '@src/ILogger';

export class Requester implements IRequester<string> {
    constructor(
        private customLogger: ILogger,
    ) {}

    sendRequest(message: string): void {
        this.customLogger.logMessage(message);
    }
}
