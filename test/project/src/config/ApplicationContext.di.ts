import { Bean, CatContext } from 'dependency-injection-cat';
import { IBeans } from '../IBeans';
import { UseCase as XZXZXZ } from '../lib/use-case/UseCase';
import { IUseCase } from '../lib/use-case/IUseCase';
import { ILogger } from '../lib/logger/ILogger';
import { Logger } from '../lib/logger/Logger';
import { IRequester } from '../lib/requester/IRequester';
import { IModel } from '../lib/models/IModel';
import { ModelRequester } from '../lib/requester/ModelRequester';
import { IRepository } from '../lib/repository/IRepository';
import { ModelRepository } from '../lib/repository/ModelRepository';

export class ApplicationContext extends CatContext<IBeans> {
    useCase = Bean<IUseCase>(XZXZXZ);
    requester = Bean<IRequester<IModel>>(ModelRequester)
    repository = Bean<IRepository<IModel>>(ModelRepository)

    @Bean
    logger(): ILogger {
        return new Logger();
    }
}
