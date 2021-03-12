import { IRequester } from './IRequester';
import { IModel } from '../models/IModel';

export class ModelRequester implements IRequester<IModel> {
    async get(url: string): Promise<IModel> {
        const isSuccess = Math.random() > 0.5;

        if (isSuccess) {
            return {
                field1: 'field1',
                field2: 1231231,
            };
        }

        return Promise.reject(`No data by url ${url}`);
    }
}
