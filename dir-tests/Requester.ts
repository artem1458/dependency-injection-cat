import { IRequester } from './IRequester';
import { ILogger } from './ILogger';

export class Requester implements IRequester {
    constructor(
        private logger: ILogger,
    ) {}

    get(url: string): void {
        this.logger.log(`Making get request to url ${url}`);
    }
}
