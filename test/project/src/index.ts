import { container } from 'dependency-injection-cat';
import { IUseCase, Logger, Requester } from './configs/UseCase';

export interface IBeans {
    useCase: IUseCase;
    requester: Requester;
    logger: Logger;
}

const context = container.initContext<IBeans>({
    name: 'SomeContext',
});

console.log(context.getBeans());
