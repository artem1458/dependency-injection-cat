import { Bean, CatContext } from 'dependency-injection-cat';

export interface ITestContext {
}

export interface XZ<T> {
}

class TestContext extends CatContext<ITestContext> {
    // @ts-ignore
    @Bean test: string & number & XZ<any> = [] as any;

    @Bean
    xz(
        d: string[],
    ): void {
        d;
    }
}
