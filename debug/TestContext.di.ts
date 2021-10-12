import { Bean, CatContext } from 'dependency-injection-cat';

export interface ITestContext {
    data: string & number
}
export interface XZ {}

class TestContext extends CatContext<ITestContext> {
    // @ts-ignore
    @Bean data: string & number = '';
    @Bean objectAndString: string & XZ = 'objectAndString'
    @Bean strOnly: XZ & string = 'strOnly'

    @Bean
    test(
        objectAndString: XZ & string,
    ): string {
        return '';
    }
}
