import { CatContext, Bean } from 'dependency-injection-cat';

export interface IT {}
export interface XZ {}

export class AA {}

export class TestConfig2 extends CatContext {
    // beann = Bean(AA)

    @Bean
    someBean() {
        return new AA();
    }
    //
    // @Bean
    // someBean232(): XZ {
    //     return {};
    // }

}
