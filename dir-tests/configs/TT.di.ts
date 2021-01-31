import { Bean, CatContext } from 'dependency-injection-cat';
import { IUseCase, Logger, Requester, UseCase } from './types2';

export class TTDi extends CatContext {
    useCase: IUseCase = Bean(UseCase)

    @Bean
    requester(
        logger: Logger,
    ): Requester {
        return {};
    }

    @Bean
    logger(): Logger {
        return {};
    }
}
