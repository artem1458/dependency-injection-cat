import { IUseCase } from './lib/use-case/IUseCase';
import { ILogger } from './lib/logger/ILogger';

export interface IBeans {
    useCase: IUseCase;
    logger: ILogger;
}
