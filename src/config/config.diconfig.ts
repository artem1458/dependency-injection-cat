import defa from '@src/testFile'
import { AAA as BBB, ABC } from './types';
import { DiConfigTestClass } from '@src/config/DiConfigTestClass';

export class ConfigDiconfig2 {
    method3(): defa {
        return {
            someField: '',
        }
    }

    method2(): BBB.IDiConfigTest2 {
        return {
            someField: '',
        };
    }
}

export class ConfigDiconfig {
    method(
        type: BBB.IDiConfigTest2,
    ): BBB.IDiConfigTest {
        return new DiConfigTestClass(type);
    }
}

