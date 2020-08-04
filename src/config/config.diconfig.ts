import { AAA as BBB } from '@src/config/types';
import { DiConfigTestClass } from '@src/config/DiConfigTestClass';

export class ConfigDiconfig {
    method(
        type: BBB.IDiConfigTest2,
    ): BBB.IDiConfigTest {
        return new DiConfigTestClass();
    }

    method2(): BBB.IDiConfigTest2 {
        return new DiConfigTestClass();
    }
}
