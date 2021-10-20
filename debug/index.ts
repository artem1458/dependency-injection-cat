import { container } from 'dependency-injection-cat';
import { ITestContext } from './TestContext.di';

export const context = container.initContext<ITestContext>({
    name: 'TestContext',
});

console.log(context.getBeans());
