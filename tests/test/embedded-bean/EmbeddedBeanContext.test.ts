import { container } from 'dependency-injection-cat';
import { IEmbeddedBeanContext } from './IEmbeddedBeanContext';
import { assertEquals, assertTrue } from '../assertions';
import { WithoutDependencies } from '../../src/classes/without-dependencies/WithoutDependencies';
import { DependencyFromNodeModuleWithDependency, DependencyFromNodeModuleWithoutDependencies } from 'mock_node_module';
import { get } from 'lodash';
import { WithDependencies } from '../../src/classes/with-dependencies/WithDependencies';

describe('EmbeddedBeanContextTests', () => {
    it('should correctly use embedded beans', () => {
        //Given
        const context = container.initContext<IEmbeddedBeanContext>({
            name: 'EmbeddedBeanContext'
        });

        //When
        const beans = context.getBeans();

        //Then
        assertTrue(beans.embedded.withoutDependencies instanceof WithoutDependencies);
        assertTrue(beans.embedded.withoutDependenciesFromNodeModule instanceof DependencyFromNodeModuleWithoutDependencies);

        assertTrue(beans.withDependenciesFromNodeModule instanceof DependencyFromNodeModuleWithDependency);

        assertTrue(get(beans.withDependenciesFromNodeModule, 'dep0') instanceof DependencyFromNodeModuleWithoutDependencies);
        assertEquals(get(beans.withDependenciesFromNodeModule, 'dep0'), beans.embedded.withoutDependenciesFromNodeModule);

        assertTrue(beans.withDependenciesFromEmbeddedBeans instanceof WithDependencies);

        assertEquals(get(beans.withDependenciesFromEmbeddedBeans, 'withoutDependencies'), beans.embedded.withoutDependencies);
        assertEquals(get(beans.withDependenciesFromEmbeddedBeans, 'withoutDependenciesImpl'), beans.embedded.withoutDependencies);
        assertEquals(get(beans.withDependenciesFromEmbeddedBeans, 'withDependenciesFromNodeModule'), beans.withDependenciesFromNodeModule);
        assertEquals(get(beans.withDependenciesFromEmbeddedBeans, 'withDependenciesFromNodeModuleImpl'), beans.withDependenciesFromNodeModule);
    });
});
