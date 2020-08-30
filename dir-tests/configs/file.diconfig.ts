import { Bean, TClassConstructor } from 'ts-pring';
import { ILogger } from '../ILogger';
import { Logger } from '../Logger';

export class FileDiconfig {
    @Bean({ qualifier: 'consoleLogger' })
    logger(): ILogger {
        return new Logger();
    }
}
