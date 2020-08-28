import { Bean, Qualifier } from 'ts-pring';
import { IRequester } from '../IRequester';
import { Requester } from '../Requester';
import { ILogger } from '../ILogger';

export class AnotherConfigDiconfig {
    @Bean
    requester(
        @Qualifier('Loggger') logger: ILogger,
    ): IRequester {
        return new Requester(logger);
    }
}
