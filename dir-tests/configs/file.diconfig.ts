import { Bean, Singleton } from 'ts-pring';
import { ILogger } from '../ILogger';
import { Logger } from '../Logger';

export class FileDiconfig {
    @Bean
    @Singleton
    logger(): ILogger {
        return new Logger();
    }
}
