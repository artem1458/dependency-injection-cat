import { Qualifier, CatContext, Bean } from 'dependency-injection-cat';
import { IBeans } from '../IBeans';
import { TString, UseCase } from '../lib/use-case/UseCase';
import { IUseCase } from '../lib/use-case/IUseCase';
import { IRequester } from '../lib/requester/IRequester';
import { IModel } from '../lib/models/IModel';
import { ModelRequester } from '../lib/requester/ModelRequester';
import { Logger } from '../lib/logger/Logger';
import { ILogger } from '../lib/logger/ILogger';

export class ApplicationContext extends CatContext<IBeans> {
    useCase = Bean<IUseCase>(UseCase);
    requester = Bean<IRequester<IModel>>(ModelRequester);
    logger = Bean<ILogger>(Logger);

    @Bean
    str(): TString {
        return '';
    }
}
