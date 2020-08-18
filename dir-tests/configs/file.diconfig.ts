import { Bean, Singleton } from 'ts-pring';
import { ILogger } from '../ILogger';
import { Logger } from '../Logger';

export class FileDiconfig {
    @Bean({ name: 'BeanName', scope: 'prototype' })
    @Singleton
    logger(): ILogger {
        return new Logger();
    }
}
