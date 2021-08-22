import { Bean, CatContext, PostConstruct, BeforeDestruct } from 'dependency-injection-cat';
import { IWithoutDependencies } from '../classes/without-dependencies/IWithoutDependencies';
import { WithoutDependencies } from '../classes/without-dependencies/WithoutDependencies';
import {
    DependencyFromNodeModuleWithDependency,
    DependencyFromNodeModuleWithoutDependencies,
    IDependencyFromNodeModuleWithDependency
} from 'mock_node_module';
import { IDependencyFromNodeModuleWithoutDependencies } from 'mock_node_module/dependency-from-node-module-without-dependencies/IDependencyFromNodeModuleWithoutDependencies';
import { IBeans } from './IBeans';
import { IWithDependencies } from '../classes/with-dependencies/IWithDependencies';
import { WithDependencies } from '../classes/with-dependencies/WithDependencies';

class TestContext extends CatContext<IBeans> {
    withoutDependencies: IWithoutDependencies = Bean(WithoutDependencies)
    withoutDependenciesImpl = Bean(WithoutDependencies)

    withDependencies: IWithDependencies = Bean(WithDependencies);


    //From Node Modules
    dependencyFromNodeModulesWithoutDependencies: IDependencyFromNodeModuleWithoutDependencies = Bean(DependencyFromNodeModuleWithoutDependencies)
    withDependenciesFromNodeModule: IDependencyFromNodeModuleWithDependency = Bean(DependencyFromNodeModuleWithDependency)
    withDependenciesFromNodeModuleImpl = Bean(DependencyFromNodeModuleWithDependency)

    @PostConstruct
    @BeforeDestruct
    onPostConstruct(withoutDependencies: IWithoutDependencies) {}
}
