import { Bean, CatContext, EmbeddedBean } from 'dependency-injection-cat';

export interface ITestContext {
    data: string;
}

export interface IRequester {}


export class TestContext extends CatContext<ITestContext> {
    @EmbeddedBean test: IRequester = {};

    @Bean data: string = '';
    a = Bean(A);
}


export class A {
    constructor(
        data: string,
        data1: string,
        data2: string,
        data3: string,
        data4: string,
    ) {}
}
