import { Bean, CatContext } from 'dependency-injection-cat';

export interface ITestContext {
}

export interface XZ<T> {
}

class TestContext extends CatContext<ITestContext> {
    @Bean test: string & XZ<string & number> = [] as any;

    @Bean
    xz(
        d: string & XZ<string & number>,
    ): void {
        d;
    }
}
