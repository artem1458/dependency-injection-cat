import { GlobalCatContext, Bean } from 'dependency-injection-cat';
import { Logger } from '../lib/logger/Logger';
import { ILogger } from '../lib/logger/ILogger';
import { IRequester } from '../lib/requester/IRequester';
import { IModel } from '../lib/models/IModel';
import { IUseCase } from '../lib/use-case/IUseCase';
import { UseCase } from '../lib/use-case/UseCase';
import { ModelRequester } from '../lib/requester/ModelRequester';

export class Global extends GlobalCatContext {
    logger2 = Bean<ILogger>(Logger)
}
