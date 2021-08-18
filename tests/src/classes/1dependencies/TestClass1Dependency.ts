import { ITestClass1Dependency } from '../0dependencies/ITestClass1Dependency';
import { ITestClass0Dependencies } from '../0dependencies/ITestClass0Dependencies';

export class TestClass1Dependency implements ITestClass1Dependency {
    constructor(
        private testClass0Dependencies: ITestClass0Dependencies,
    ) {}
}
