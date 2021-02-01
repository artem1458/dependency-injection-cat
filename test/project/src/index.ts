import { container } from 'dependency-injection-cat';
import { IUseCase, Logger, Requester } from './configs/UseCase';

interface IBeans {
    useCase: IUseCase;
    requester: Requester;
    logger: Logger;
}

const context = container.initContext<IBeans>({
    name: 'TTDi',
});


console.log(context.getBeans());
