import { CatContext, Bean } from 'dependency-injection-cat';

export interface IT {}
export interface XZ {}

export class AA {}

export class TestConfig2 extends CatContext {
    beann: IT = Bean<XZ>(AA)

    @Bean
    someBean232() {
        return {};
    }

    @Bean({ qualifier: '' })
    someBean232232() {
        return {};
    }
}
