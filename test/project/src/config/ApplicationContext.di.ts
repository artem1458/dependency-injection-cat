import { Bean, CatContext } from 'dependency-injection-cat';
import { IBeans } from '../IBeans';
import { UseCase } from '../lib/use-case/UseCase';
import { IUseCase } from '../lib/use-case/IUseCase';
import { IRequester } from '../lib/requester/IRequester';
import { IModel } from '../lib/models/IModel';
import { ModelRequester } from '../lib/requester/ModelRequester';

export class ApplicationContext extends CatContext<IBeans> {
    requester: IRequester<IModel> = Bean(ModelRequester);
    useCase: IUseCase = Bean(UseCase);
}
