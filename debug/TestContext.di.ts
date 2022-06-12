import { Bean, CatContext, EmbeddedBean, PostConstruct } from 'dependency-injection-cat';

export interface ITestContext {
    data: string;
}

export interface IRequester {}


class TestContext extends CatContext<ITestContext> {
    @Bean data: string = '123';
    a = Bean(A);
}


export class A {
    constructor(data: string) {
    }
}
