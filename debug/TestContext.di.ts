import { Bean, CatContext, PostConstruct } from 'dependency-injection-cat';

export interface ITestContext {
}

export interface IRequester<T> {}

class TestContext extends CatContext<ITestContext> {
    @PostConstruct
    test(
        t: string
    ): void {
        this;
    }

    @Bean requester5: IRequester<string[]> = {}
}
