import { Bean } from 'di-cat';
import { ILogger } from '../ILogger';
import { Logger } from '../Logger';
import { IRequester } from '../IRequester';
import { Requester } from '../Requester';

export class FileDiconfig {
    someBean = Bean<IRequester>(Requester, { qualifier: 'SuperCoolRequester', scope: 'prototype' });
    someBean2 = Bean<IRequester>(Requester, { qualifier: 'prototype' });

    @Bean({ qualifier: 'consoleLogger' })
    logger(): ILogger {
        return new Logger();
    }

    @Bean
    logger2(): ILogger {
        return new Logger();
    }
}
