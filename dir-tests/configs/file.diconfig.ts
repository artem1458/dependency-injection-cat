import { Bean, Singleton } from 'ts-pring';
import { ILogger } from '../ILogger';
import { Logger } from '../Logger';

export class FileDiconfig {
    @Bean({ qualifier: '1234', scope: 'singleton' })
    @Singleton
    logger(): ILogger {
        return new Logger();
    }
}
