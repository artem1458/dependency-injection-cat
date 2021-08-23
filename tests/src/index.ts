import { container } from 'dependency-injection-cat';
import { IBeans } from './config/IBeans';

container.initContext<IBeans>({
    name: 'TestContext'
});
