import { Bean, CatContext } from 'dependency-injection-cat';

export interface ITestContext {}

export interface XZ<T> {}

class TestContext extends CatContext<ITestContext> {
    @Bean test: XZ<''> = {}
}
