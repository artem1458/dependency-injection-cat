import { Bean, CatContext, EmbeddedBean } from 'dependency-injection-cat';
import { IEmbeddedBeanContext } from './IEmbeddedBeanContext';
import { IEmbeddedBeans } from './IEmbeddedBeans';
import { WithoutDependencies } from '../../src/classes/without-dependencies/WithoutDependencies';
import { IWithDependencies } from '../../src/classes/with-dependencies/IWithDependencies';
import {
    DependencyFromNodeModuleWithDependency,
    DependencyFromNodeModuleWithoutDependencies,
    IDependencyFromNodeModuleWithDependency
} from 'mock_node_module';
import { WithDependencies } from '../../src/classes/with-dependencies/WithDependencies';

class EmbeddedBeanContext extends CatContext<IEmbeddedBeanContext> {
    @EmbeddedBean embedded: IEmbeddedBeans = {
        withoutDependencies: new WithoutDependencies(),
        withoutDependenciesFromNodeModule: new DependencyFromNodeModuleWithoutDependencies(),
    }

    withDependenciesFromNodeModule: IDependencyFromNodeModuleWithDependency & DependencyFromNodeModuleWithDependency =
        Bean(DependencyFromNodeModuleWithDependency)

    withDependenciesFromEmbeddedBeans: IWithDependencies = Bean(WithDependencies)
}
