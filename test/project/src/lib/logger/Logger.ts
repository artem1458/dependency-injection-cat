import { ILogger } from './ILogger';

export class Logger implements ILogger {
    logError(message: string): void {
        console.error(message);
    }
}
