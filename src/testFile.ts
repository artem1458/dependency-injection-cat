import { IInterface } from './Interfaces';
import { ConfigDiconfig } from '@src/config/config.diconfig';

const inst = new ConfigDiconfig();

console.log(ConfigDiconfig.method2() === ConfigDiconfig.method2());
console.log(ConfigDiconfig.method2());
aa()

function aa(): IInterface {
    return {
        a: 'a',
    }
}

// function aa(): CC<IT> & IT {
//     return {
//         a: 'a',
//         c: {
//             b: {
//                 a: 'a'
//             }
//         }
//     }
// }
