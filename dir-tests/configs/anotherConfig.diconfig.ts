import { Bean, Qualifier } from 'dependency-injection-cat';
import { IRequester } from '../IRequester';
import { Requester } from '../Requester';
import { ILogger } from '../ILogger';

export class AnotherConfigDiconfig {
    @Bean({ qualifier: '123' })
    requester(
        @Qualifier('consoleLogger') logger: ILogger,
    ): IRequester {
        return new Requester(logger);
    }
}
