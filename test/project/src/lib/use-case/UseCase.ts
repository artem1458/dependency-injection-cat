import { IUseCase } from './IUseCase';
import { IRequester } from '../requester/IRequester';
import { IModel } from '../models/IModel';
import { ILogger } from '../logger/ILogger';

export type TString = string;

export class UseCase implements IUseCase {
    constructor(
        private requester: IRequester<IModel>,
        private baseLogger: ILogger,
        private consoleLogger: ILogger,
    ) {}

    async makeSomeBusinessLogic(): Promise<void> {
        try {
            // const response = await this.requester.get('http://someUrl.com');

            // this.contextMap.saveData(response);
        } catch (error) {
            this.baseLogger.logError(error.message);
        }
    }
}
