import { Bean, CatContext } from 'dependency-injection-cat';
import { IUseCase, Logger, Requester, UseCase } from './UseCase';

export class TTDi extends CatContext {
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
