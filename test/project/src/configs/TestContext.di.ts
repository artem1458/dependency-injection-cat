import { Bean, CatContext } from 'dependency-injection-cat';
import { IUseCase, Logger, Requester, UseCase } from './UseCase';

export interface IBeans {
    logger: Logger;
}

export class TestContextDi extends CatContext<IBeans> {
    @Bean
    logger(): Logger {
        return {};
    }
}
