import { ILogger } from './ILogger';

export class Logger implements ILogger {
    log(message: string): void {
        console.log(message);
    }
}
