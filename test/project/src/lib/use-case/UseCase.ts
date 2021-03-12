import { IUseCase } from './IUseCase';
import { IRequester } from '../requester/IRequester';
import { IRepository } from '../repository/IRepository';
import { IModel } from '../models/IModel';
import { ILogger } from '../logger/ILogger';

export type TString = string;

export class UseCase implements IUseCase {
    constructor(
        private requester: IRequester<IModel>,
        private logger: ILogger,
        private str: TString,
    ) {}

    async makeSomeBusinessLogic(): Promise<void> {
        try {
            const response = await this.requester.get('http://someUrl.com');

            // this.repository.saveData(response);
        } catch (error) {
            this.logger.logError(error.message);
        }
    }
}
