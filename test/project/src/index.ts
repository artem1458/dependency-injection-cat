import { container } from 'dependency-injection-cat';
import { IBeans } from './IBeans';

const beans = container.initContext<IBeans>({
    name: 'ApplicationContext',
}).getBeans();

console.log(beans.logger);

