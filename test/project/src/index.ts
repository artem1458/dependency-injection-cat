import { container } from 'dependency-injection-cat';
import { IBeans } from './IBeans';

const appContext = container.initContext<IBeans>({
    name: 'ApplicationContext',
});

appContext.getBean('logger');

