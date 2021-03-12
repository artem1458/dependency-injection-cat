import { IUseCase } from './IUseCase';
import { IRequester } from '../requester/IRequester';
import { ILogger } from '../logger/ILogger';
import { IRepository } from '../repository/IRepository';
import { IModel } from '../models/IModel';

export class UseCase implements IUseCase {
    constructor(
        private requester: IRequester<IModel>,
        private logger: ILogger,
        private repository: IRepository<IModel>
    ) {}

    async makeSomeBusinessLogic(): Promise<void> {
        try {
            const response = await this.requester.get('http://someUrl.com');

            this.repository.saveData(response);
        } catch (error) {
            this.logger.logError(error.message);
        }
    }
}
