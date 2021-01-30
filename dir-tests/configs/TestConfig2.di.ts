import { Bean, CatContext } from 'dependency-injection-cat';

export interface IT {}

export class TestConfig extends CatContext {
    @Bean
    someBBbean(): IT {
        return {};
    }
}
