import { AAA as BBB, ABC } from './types';
import defa from '@src/testFile'
import { DiConfigTestClass } from '@src/config/DiConfigTestClass';
// import { Bean } from 'ts-pring';

export interface IInterface<T> {}

export class ConfigDiconfig2 {
    // @Bean
    method5(): BBB.IDiConfigTest2 {
        return {
            someField: '',
        };
    }

    mt(): IInterface<IInterface<ABC.DEF.IDiConfigTest2>> & IInterface<ABC.DEF.IDiConfigTest2> & ABC.DEF.IDiConfigTest2 {
        return {
            someField: '',
        }
    }

    // @Bean
    method3(def: BBB.IDiConfigTest2): defa {
        return {
            someField: '',
        }
    }
}

export class ConfigDiconfig {
    // @Bean
    method(
        type: BBB.IDiConfigTest2,
    ): BBB.IDiConfigTest {
        return new DiConfigTestClass(type);
    }


}
