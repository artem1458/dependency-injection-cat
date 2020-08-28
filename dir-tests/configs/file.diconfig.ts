import { Bean } from 'ts-pring';
import { ILogger } from '../ILogger';
import { Logger } from '../Logger';

export class FileDiconfig {
    @Bean({ scope: 'singleton' })
    logger(): ILogger {
        return new Logger();
    }
}
