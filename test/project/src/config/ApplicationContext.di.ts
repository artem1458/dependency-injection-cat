import { Bean, CatContext, Qualifier } from 'dependency-injection-cat';
import { IBeans } from '../IBeans';
import { UseCase } from '../lib/use-case/UseCase';
import { IUseCase } from '../lib/use-case/IUseCase';
import { IRequester } from '../lib/requester/IRequester';
import { IModel } from '../lib/models/IModel';
import { ModelRequester } from '../lib/requester/ModelRequester';
import { ILogger } from '../lib/logger/ILogger';
import { Logger } from '../lib/logger/Logger';

export class ApplicationContext extends CatContext<IBeans>{
    requester = Bean<IRequester<IModel>>(ModelRequester);
    baseLogger = Bean<ILogger>(Logger);
    consoleLogger = Bean<ILogger>(Logger);

    useCase: IUseCase = Bean(UseCase);
}
