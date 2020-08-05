import { AAA as BBB } from './types';
import { DiConfigTestClass } from '@src/config/DiConfigTestClass';

export class ConfigDiconfig {
    method( //TODO replace arguments in constructor on factories calls
        type: BBB.IDiConfigTest2,
    ): BBB.IDiConfigTest {
        return new DiConfigTestClass(type);
    }
}
