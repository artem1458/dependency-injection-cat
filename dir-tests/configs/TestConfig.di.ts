import { CatContext, Bean } from 'dependency-injection-cat';
import { Dep1, Dep2, Dep3, SomeClass, XZ } from '../configs/types';

export class TestConfig2 extends CatContext {
    beann = Bean(SomeClass)

    @Bean
    xzxz(): Dep1 {
        return {};
    }

    @Bean
    xzxz2(): Dep2 {
        return {};
    }

    @Bean
    xzxz3(): Dep3 {
        return {};
    }

    @Bean
    xz(): XZ {
        return {};
    }
}

