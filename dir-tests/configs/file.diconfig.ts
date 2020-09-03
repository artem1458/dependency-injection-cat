import { Bean } from 'ts-pring';
import { ILogger } from '../ILogger';
import { Logger } from '../Logger';

export class FileDiconfig {
    someProps = Bean<ILogger>(Logger, { qualifier: 'consoleLogger1' });

    @Bean({ qualifier: 'consoleLogger' })
    logger(): ILogger {
        return new Logger();
    }
}
