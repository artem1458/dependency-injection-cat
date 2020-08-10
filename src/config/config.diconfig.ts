import { ILogger } from '@src/ILogger';
import { Logger } from '@src/Logger';
import { Requester } from '@src/Requester';
import { IRequester } from '@src/IRequester';

export class ConfigDiconfig {
    logger(): ILogger {
        return new Logger();
    }

    requester(
        logger: ILogger,
    ): IRequester<string> {
        return new Requester(logger);
    }
}
