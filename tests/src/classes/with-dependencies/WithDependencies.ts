import { IWithDependencies } from './IWithDependencies';
import { IWithoutDependencies } from '../without-dependencies/IWithoutDependencies';
import { WithoutDependencies } from '../without-dependencies/WithoutDependencies';
import { DependencyFromNodeModuleWithDependency, IDependencyFromNodeModuleWithDependency } from 'mock_node_module';

export class WithDependencies implements IWithDependencies {
    constructor(
        private withoutDependencies: IWithoutDependencies,
        private withoutDependenciesImpl: WithoutDependencies,
        private withDependenciesFromNodeModule: IDependencyFromNodeModuleWithDependency,
        private withDependenciesFromNodeModuleImpl: DependencyFromNodeModuleWithDependency,
    ) {}
}
