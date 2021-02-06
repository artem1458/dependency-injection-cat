import { container } from 'dependency-injection-cat';
import { IBeans } from './IBeans';

const context = container.initContext<IBeans>({
    name: 'ApplicationContext',
});

const useCase = context.getBean('useCase');
console.log(useCase);
useCase.makeSomeBusinessLogic();

