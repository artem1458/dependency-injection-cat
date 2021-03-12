import { container } from 'dependency-injection-cat';
import { IBeans } from './IBeans';

const context = container.initContext<IBeans>({
    name: 'ApplicationContext',
});

context.getBean('logger').logError('21312312132123312');

