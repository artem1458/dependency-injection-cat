import { CatContext, EmbeddedBean, PostConstruct } from 'dependency-injection-cat';
export interface ITestContext {}
export interface IRequester<T> {}

class TestContext extends CatContext<ITestContext> {
}
