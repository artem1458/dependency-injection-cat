import { container } from 'dependency-injection-cat';
import { IBeans } from '../src/config/IBeans';
import { get } from 'lodash';
import assert from 'assert';
import { TestClass1Dependency } from '../src/classes/1dependencies/TestClass1Dependency';
import { TestClass0Dependencies } from '../src/classes/1dependencies/TestClass0Dependencies';

describe('PlainPropertyBeansContext tests', () => {
    it('should build testClass1Dependency', () => {
        //Given
        const context = container.initContext<IBeans>({
            name: 'PlainPropertyBeansContext'
        });

        //When
        const instance = context.getBean('testClass1Dependency');

        //Then
        const testClass0Dependencies = get(instance, 'testClass0Dependencies');

        assert.strictEqual(instance instanceof TestClass1Dependency, true);
        assert.strictEqual(testClass0Dependencies instanceof TestClass0Dependencies, true);
    });
});
