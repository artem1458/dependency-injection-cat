import { IEmbeddedBeans } from './IEmbeddedBeans';
import { IWithDependencies } from '../../src/classes/with-dependencies/IWithDependencies';
import { IDependencyFromNodeModuleWithDependency } from 'mock_node_module';

export interface IEmbeddedBeanContext {
    embedded: IEmbeddedBeans;
    withDependenciesFromEmbeddedBeans: IWithDependencies;
    withDependenciesFromNodeModule: IDependencyFromNodeModuleWithDependency;
}
