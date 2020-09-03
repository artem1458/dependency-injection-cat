import { Bean } from 'ts-pring';
import { ILogger } from '../ILogger';
import { Logger } from '../Logger';
import { IRequester } from '../IRequester';
import { Requester } from '@src/../dir-tests/Requester';

export class FileDiconfig {
    someProps = Bean<IRequester>(Requester);

    @Bean({ qualifier: 'consoleLogger' })
    logger(): ILogger {
        return new Logger();
    }
}
