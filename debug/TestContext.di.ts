import { CatContext, EmbeddedBean, PostConstruct } from 'dependency-injection-cat';

export interface ITestContext {
    embeddedBeans: IEmbeddedBeans;
}

export interface IRequester {}
export interface IEmbeddedBeans {
    requester: IRequester;
}


class TestContext extends CatContext<ITestContext> {
    @EmbeddedBean embeddedBeans: IEmbeddedBeans = {
        requester: {}
    }

    @PostConstruct
    postConstruct(
        requester: IRequester,
    ): void {
        console.log(requester);
    }
}
