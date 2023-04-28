import { container } from 'dependency-injection-cat';
import { IBeans } from './config/IBeans';
import { TestContext } from './config/TestContext';

container.initContext<IBeans>({
    context: TestContext
});
