import { IUseCase } from './lib/use-case/IUseCase';
import { container } from 'dependency-injection-cat';

export interface IBeans {
    useCase: IUseCase;
}
const context = container.initContext<IBeans>({
    name: 'ApplicationContext',
});

console.log(context);
