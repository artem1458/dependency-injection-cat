import { AAA } from '@src/config/types';

export class DiConfigTestClass implements AAA.IDiConfigTest {
    constructor(
        a: AAA.IDiConfigTest2,
    ) {
    }
    someField: string = '123';
}
