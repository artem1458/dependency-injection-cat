import { Bean, CatContext } from 'dependency-injection-cat';
import { IUseCase, Logger, Requester, UseCase } from './UseCase';

export interface IBeans {
    logger: Logger;
    anotherLogger: Logger;
    anotherLogger2: Logger;
    anotherLogger3: Logger;
}

export class TTDi extends CatContext<IBeans> {
    useCase: IUseCase = Bean(UseCase)

    @Bean
    requester(
        logger: Logger,
    ): Requester {
        return {};
    }

    @Bean
    logger(
    ): Logger {
        return {};
    }
}
