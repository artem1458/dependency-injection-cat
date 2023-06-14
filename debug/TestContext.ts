import { Bean, CatContext, EmbeddedBean, PostConstruct, BeforeDestruct } from 'dependency-injection-cat';

export interface ITestContext {
    data: string;
}

export interface IA {}

class B {}

export class A extends B {
    constructor(
        data: string,
        data1: string,
        data2: string,
        data3: string,
        data4: string,
    ) {
        super();
    }
}

export class TestContext extends CatContext {
    @Bean str1 = 'str1';

    a = Bean(A);

    @Bean
    methodBean(
        clazz: A,
        interfaze: B,
    ): number {
        return Number();
    }

}
