import { Bean } from 'ts-pring';
import { ILogger } from '../ILogger';
import { Logger } from '../Logger';

export class FileDiconfig {
    @Bean({ scope: 'singleton', qualifier: 'Loggger' })
    logger(): ILogger {
        return new Logger();
    }
}
