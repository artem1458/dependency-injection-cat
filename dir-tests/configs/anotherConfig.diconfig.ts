import { Bean, Qualifier } from 'dependency-injection-cat';
import { IRequester } from '../IRequester';
import { Requester } from '../Requester';
import { ILogger } from '../ILogger';

export class AnotherConfigDiconfig {
    @Bean
    requester(
        @Qualifier({ contextName?: string, beanName?: string }) logger: ILogger,
        @Qualifier({ contextName?: string, beanName?: string }) logger: ILogger,
    ): IRequester {
        return new Requester(logger);
    }

    logger2(): ILogger {
        return new SentryLogger();
    }

    requester2 = Bean<IRequester>(Requester);
}
