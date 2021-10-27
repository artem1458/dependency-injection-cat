import { Bean, CatContext } from 'dependency-injection-cat';

export interface ITestContext {
}

export interface IRequester<T> {}

class TestContext extends CatContext<ITestContext> {
    @Bean requester5: IRequester<string[]> = {}
}
