import { Bean, CatContext } from 'dependency-injection-cat';

export interface ITestContext {}
export interface XZ {}

class TestContext extends CatContext<ITestContext> {
    @Bean objectAndString: string & XZ = 'objectAndString'
    @Bean strOnly: XZ & string = 'strOnly'

    @Bean
    test(
        objectAndString: XZ & string,
    ): string {
        return '';
    }
}
