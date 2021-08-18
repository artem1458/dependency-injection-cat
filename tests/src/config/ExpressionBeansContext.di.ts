import { Bean, CatContext } from 'dependency-injection-cat';
import { IBeans } from './IBeans';
import { ITestClass0Dependencies } from '../classes/0dependencies/ITestClass0Dependencies';
import { TestClass0Dependencies } from '../classes/1dependencies/TestClass0Dependencies';
import { ITestClass1Dependency } from '../classes/0dependencies/ITestClass1Dependency';
import { TestClass1Dependency } from '../classes/1dependencies/TestClass1Dependency';

class ExpressionBeansContext extends CatContext<IBeans> {
    @Bean testClass0Dependencies: ITestClass0Dependencies = new TestClass0Dependencies()

    @Bean testClass1Dependency: ITestClass1Dependency = new TestClass1Dependency(new TestClass0Dependencies())
}
