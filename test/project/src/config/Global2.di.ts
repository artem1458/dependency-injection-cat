import { GlobalCatContext, Bean } from 'dependency-injection-cat';
import { IRequester } from '../lib/requester/IRequester';
import { IModel } from '../lib/models/IModel';
import { ModelRequester } from '../lib/requester/ModelRequester';

export class Global extends GlobalCatContext {
    requester = Bean<IRequester<IModel>>(ModelRequester)
}
