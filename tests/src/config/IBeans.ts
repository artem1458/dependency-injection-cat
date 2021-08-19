import { IWithoutDependencies } from '../classes/without-dependencies/IWithoutDependencies';
import { WithoutDependencies } from '../classes/without-dependencies/WithoutDependencies';
import { IDependencyFromNodeModuleWithoutDependencies } from '../../mock_node_module';
import { DependencyFromNodeModuleWithDependency, IDependencyFromNodeModuleWithDependency } from 'mock_node_module';
import { IWithDependencies } from '../classes/with-dependencies/IWithDependencies';

export interface IBeans {
    withoutDependencies: IWithoutDependencies;
    withoutDependenciesImpl: WithoutDependencies;
    withDependencies: IWithDependencies;

    dependencyFromNodeModulesWithoutDependencies: IDependencyFromNodeModuleWithoutDependencies;
    withDependenciesFromNodeModule: IDependencyFromNodeModuleWithDependency;
    withDependenciesFromNodeModuleImpl: DependencyFromNodeModuleWithDependency;
}
