import { Bean, CatContext, EmbeddedBean, PostConstruct } from 'dependency-injection-cat';

export interface ITestContext {
    data: string;
}

export interface IRequester {}


class TestContext extends CatContext<ITestContext> {
    a = Bean(A);
}


export class A {
    constructor(
        data: string,
        data1: string,
        data2: string,
        data3: string,
        data4: string,
        private data5: ITestContext,
    ) {
    }
}
