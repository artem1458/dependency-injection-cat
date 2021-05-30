import { GlobalCatContext, Bean } from 'dependency-injection-cat';
import { IRequester } from '../lib/requester/IRequester';
import { IModel } from '../lib/models/IModel';
import { ModelRequester } from '../lib/requester/ModelRequester';

class AnotherGlobalContextDi extends GlobalCatContext {
    requester: IRequester<IModel> = Bean(ModelRequester);
}
