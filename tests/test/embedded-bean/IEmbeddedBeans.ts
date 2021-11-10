import { IWithoutDependencies } from '../../src/classes/without-dependencies/IWithoutDependencies';
import { WithoutDependencies } from '../../src/classes/without-dependencies/WithoutDependencies';
import {
    DependencyFromNodeModuleWithoutDependencies,
    IDependencyFromNodeModuleWithoutDependencies
} from '../../mock_node_module';

export interface IEmbeddedBeans {
    withoutDependencies: IWithoutDependencies & WithoutDependencies;
    withoutDependenciesFromNodeModule: IDependencyFromNodeModuleWithoutDependencies & DependencyFromNodeModuleWithoutDependencies;
}
