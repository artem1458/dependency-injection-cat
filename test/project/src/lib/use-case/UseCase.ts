import { IUseCase } from './IUseCase';
import { ILogger } from '../logger/ILogger';
import { IRequester } from '../requester/IRequester';
import { IModel } from '../models/IModel';

export type TString = string;

export class UseCase implements IUseCase {
    constructor(
        private requester: IRequester<IModel>,
        private someLogger: ILogger,
    ) {}

    async makeSomeBusinessLogic(): Promise<void> {
        try {
            // const response = await this.requester.get('http://someUrl.com');

            // this.contextMap.saveData(response);
        } catch (error) {
            this.someLogger.logError(error.message);
        }
    }
}
