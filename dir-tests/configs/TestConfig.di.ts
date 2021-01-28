import { CatContext, Bean } from 'dependency-injection-cat';

interface IT {}

export class TestConfig2 extends CatContext {
    @Bean
    someBean(): IT {
        return {};
    }

    @Bean
    someBean232() {
        return {};
    }

}
