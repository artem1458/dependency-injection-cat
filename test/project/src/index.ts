import { container } from 'dependency-injection-cat';
import { IUseCase, Logger, Requester } from './configs/UseCase';

export interface IBeans {
    useCase: IUseCase;
    requester: Requester;
    logger: Logger;
}

const context = container.initContext<IBeans>({
    name: 'TTDi',
});

const context2 = container.initContext<IBeans>({
    name: 'TestContextDi',
});


console.log(context.getBeans());
console.log(context2.getBeans());
