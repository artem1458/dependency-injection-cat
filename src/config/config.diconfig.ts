import { AAA as BBB } from './types';
import { DiConfigTestClass } from '@src/config/DiConfigTestClass';

export class ConfigDiconfig {
    method( //TODO Make methods static, and replace arguments in constructor on factories calls
        type: BBB.IDiConfigTest2,
    ): BBB.IDiConfigTest {
        return new DiConfigTestClass(type);
    }

    method2(): BBB.IDiConfigTest2 {
        return {
            someField: '',
        };
    }
}
