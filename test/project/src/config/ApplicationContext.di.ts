import { Qualifier, CatContext, Bean } from 'dependency-injection-cat';
import { IBeans } from '../IBeans';
import { UseCase as XZXZXZ } from '../lib/use-case/UseCase';
import { IUseCase } from '../lib/use-case/IUseCase';
import { IRequester } from '../lib/requester/IRequester';
import { IModel } from '../lib/models/IModel';
import { ModelRequester } from '../lib/requester/ModelRequester';
import { IRepository } from '../lib/repository/IRepository';
import { ModelRepository } from '../lib/repository/ModelRepository';
import { Logger } from '../lib/logger/Logger';
import { ILogger } from '../lib/logger/ILogger';

export class ApplicationContext extends CatContext<IBeans> {
    useCase = Bean<IUseCase>(XZXZXZ);
    requester = Bean<IRequester<IModel>>(ModelRequester)
    logger = Bean<ILogger>(Logger)

    @Bean
    repository(
        @Qualifier('logger') logger: ILogger,
    ): IRepository<IModel> {
        return new ModelRepository();
    }
}
