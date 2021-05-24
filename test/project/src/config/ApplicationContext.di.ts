import { Bean, CatContext } from 'dependency-injection-cat';
import { IBeans } from '../IBeans';
import { UseCase } from '../lib/use-case/UseCase';
import { IUseCase } from '../lib/use-case/IUseCase';
import { IRequester } from '../lib/requester/IRequester';
import { IModel } from '../lib/models/IModel';
import { ILogger } from '../lib/logger/ILogger';

export class ApplicationContext extends CatContext<IBeans> {
    @Bean
    useCase(
        logger: ILogger,
        requester: IRequester<IModel>,
    ): IUseCase {
        return new UseCase(logger);
    }
}
