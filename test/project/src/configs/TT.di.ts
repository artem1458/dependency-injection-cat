import { Bean, CatContext } from 'dependency-injection-cat';
import { IUseCase, Logger, Requester, UseCase } from './UseCase';

export interface IBeans {
    logger: Logger;
}

export interface IConfig {
    data: string;
}

export class SomeContext extends CatContext<IBeans, IConfig> {
    useCase: IUseCase = Bean(UseCase)

    @Bean
    requester(
        logger: Logger,
    ): Requester {
        this.config.data;

        return {};
    }

    @Bean
    logger(
    ): Logger {
        return {};
    }
}
