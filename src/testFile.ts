import { IInterface } from './Interfaces';
import fs from 'fs';
// import { ConfigDiconfig } from '@src/config/config.diconfig';
//
// new ConfigDiconfig();

fs.readFileSync('./TEST2.ts');

aa();

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
