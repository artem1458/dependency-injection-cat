import assert from 'assert';
import { get } from 'lodash';
import { container } from 'dependency-injection-cat';
import { IBeans } from '../src/config/IBeans';
import { WithoutDependencies } from '../src/classes/without-dependencies/WithoutDependencies';
import { DependencyFromNodeModuleWithDependency, DependencyFromNodeModuleWithoutDependencies } from 'mock_node_module';
import { WithDependencies } from '../src/classes/with-dependencies/WithDependencies';

describe('TestContext tests', () => {
    const context = container.initContext<IBeans>({
        name: 'TestContext',
    });

    it('withoutDependencies', () => {
        //When
        const instance = context.getBean('withoutDependencies');

        //Then
        assert.strictEqual(instance instanceof WithoutDependencies, true);
    });

    it('withoutDependenciesImpl', () => {
        //When
        const instance = context.getBean('withoutDependenciesImpl');

        //Then
        assert.strictEqual(instance instanceof WithoutDependencies, true);
    });

    it('dependencyFromNodeModulesWithoutDependencies', () => {
        //When
        const instance = context.getBean('dependencyFromNodeModulesWithoutDependencies');

        //Then
        assert.strictEqual(instance instanceof DependencyFromNodeModuleWithoutDependencies, true);
    });

    it('withDependenciesFromNodeModule', () => {
        //When
        const instance = context.getBean('withDependenciesFromNodeModule');

        //Then
        const dep0 = get(instance, 'dep0');

        assert.strictEqual(instance instanceof DependencyFromNodeModuleWithDependency, true);
        assert.strictEqual(dep0, context.getBean('dependencyFromNodeModulesWithoutDependencies'));
    });

    it('withDependenciesFromNodeModuleImpl', () => {
        //When
        const instance = context.getBean('withDependenciesFromNodeModuleImpl');

        //Then
        const dep0 = get(instance, 'dep0');

        assert.strictEqual(instance instanceof DependencyFromNodeModuleWithDependency, true);
        assert.strictEqual(dep0, context.getBean('dependencyFromNodeModulesWithoutDependencies'));
    });

    it('withDependencies', () => {
        //When
        const instance = context.getBean('withDependencies');

        //Then
        const withoutDependencies = get(instance, 'withoutDependencies');
        const withoutDependenciesImpl = get(instance, 'withoutDependenciesImpl');
        const withDependenciesFromNodeModule = get(instance, 'withDependenciesFromNodeModule');
        const withDependenciesFromNodeModuleImpl = get(instance, 'withDependenciesFromNodeModuleImpl');

        assert.strictEqual(instance instanceof WithDependencies, true);
        assert.strictEqual(withoutDependencies, context.getBean('withoutDependencies'));
        assert.strictEqual(withoutDependenciesImpl, context.getBean('withoutDependenciesImpl'));
        assert.strictEqual(withDependenciesFromNodeModule, context.getBean('withDependenciesFromNodeModule'));
        assert.strictEqual(withDependenciesFromNodeModuleImpl, context.getBean('withDependenciesFromNodeModuleImpl'));
    });
});
