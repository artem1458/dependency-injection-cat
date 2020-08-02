import { AAA } from '@src/config/types';
import { DiConfigTestClass } from '@src/config/DiConfigTestClass';

export class ConfigDiconfig {
    method(
        type: AAA.IDiConfigTest2,
    ): AAA.IDiConfigTest {
        return new DiConfigTestClass();
    }

    method2(): AAA.IDiConfigTest2 {
        return new DiConfigTestClass();
    }
}
