import { Bean, Singleton } from 'ts-pring';
import { IRequester } from '../IRequester';
import { Requester } from '../Requester';
import { ILogger } from '../ILogger';

export class AnotherConfigDiconfig {
    @Bean
    @Singleton
    requester(
        logger: ILogger,
    ): IRequester {
        return new Requester(logger);
    }
}
