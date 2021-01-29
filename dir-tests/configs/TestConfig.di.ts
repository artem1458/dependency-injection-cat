import { CatContext, Bean } from 'dependency-injection-cat';
import { Qualifier } from 'dependency-injection-cat/decorators';

export interface IT {}
export interface XZ {}

export class AA {}

export class TestConfig2 extends CatContext {
    beann: XZ = Bean<XZ>(AA)

    @Bean
    someBean232() {
        return {};
    }

    @Bean({ qualifier: 'sd' })
    someBean232232(
        @Qualifier('sd') test: XZ
    ) {
        return {};
    }
}
