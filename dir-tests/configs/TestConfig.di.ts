import { CatContext, Bean } from 'dependency-injection-cat';

export interface IT {}
export interface XZ {}

export class AA {}

export class TestConfig2 extends CatContext {
    beann = Bean(AA)

    // @Bean
    // someBean(): IT {
    //     return {};
    // }
    //
    // @Bean
    // someBean232(): XZ {
    //     return {};
    // }

}
