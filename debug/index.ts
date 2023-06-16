import { CatContext, container, Bean, PostConstruct } from 'dependency-injection-cat';
import { ClassWithDependencies } from './ClassWithDependencies';

export class TestContext extends CatContext {
    @PostConstruct
    postConstruct(
        classWithDependencies: ClassWithDependencies,
    ) {
        console.log(classWithDependencies);
    }

    classWithDependencies = Bean(ClassWithDependencies);

    @Bean a = 'a_string';
    @Bean b = 'b_string';
    @Bean c = 'c_string';
}


export const context = container.initContext({
    context: TestContext,
});

console.log(context.getBeans());
