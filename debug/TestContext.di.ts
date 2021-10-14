import { Bean, CatContext } from 'dependency-injection-cat';

export interface ITestContext {
    test: string[]
}
export interface XZ {}

class TestContext extends CatContext<ITestContext> {
    @Bean listString: string[] = [];

    @Bean
    test(
        allStrings: string[],
    ): string[] {
        return allStrings;
    }
}
