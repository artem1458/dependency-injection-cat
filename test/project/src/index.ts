import { container } from 'dependency-injection-cat';
import { IBeans } from './IBeans';

const context = container.initContext<IBeans>({
    name: 'ApplicationContext',
});
const context2 = container.initContext<IBeans>({
    name: 'ApplicationContext',
});

console.log(context.getBeans());
console.log(context2.getBeans());
