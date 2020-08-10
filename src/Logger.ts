import { ILogger } from '@src/ILogger';

export class Logger implements ILogger {
    logMessage(message: string): void {
        console.log(message);
    }
}
