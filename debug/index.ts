import { container } from 'dependency-injection-cat';
import { ITestContext } from './TestContext.di';

const context = container.initContext<ITestContext>({
    name: 'TestContext',
});

console.log(context.getBeans());
