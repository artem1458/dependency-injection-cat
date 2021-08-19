import { IDependencyFromNodeModuleWithDependency } from './IDependencyFromNodeModuleWithDependency';
import { IDependencyFromNodeModuleWithoutDependencies } from '../dependency-from-node-module-without-dependencies/IDependencyFromNodeModuleWithoutDependencies';
export declare class DependencyFromNodeModuleWithDependency implements IDependencyFromNodeModuleWithDependency {
    private dep0;
    constructor(dep0: IDependencyFromNodeModuleWithoutDependencies);
}
