import { Bean, CatContext, EmbeddedBean, PostConstruct, BeforeDestruct } from 'dependency-injection-cat';

export interface ITestContext {
    data: string;
}

export interface IRequester {}

export class TestContext extends CatContext {
    @Bean str1 = 'str1';
    @Bean str2 = 'str2';
    @Bean str3 = 'str3';
    @Bean str4 = 'str4';
    @Bean str5 = 'str5';
    @Bean str6 = 'str6';

    @Bean
    methodBean(allStrings: Map<string, any>): number {
        return Number();
    }

}

export class A implements IRequester {
    constructor(
        data: string,
        data1: string,
        data2: string,
        data3: string,
        data4: string,
    ) {}
}
