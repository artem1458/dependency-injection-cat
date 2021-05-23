import { container } from 'dependency-injection-cat';
import { IBeans } from './IBeans';

const context = container.initContext<IBeans>({
    name: 'ApplicationContext',
});

console.log(context.getBeans());
