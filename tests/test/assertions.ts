import assert from 'assert';

export const assertTrue = (value: boolean): void => assert.strictEqual(value, true);
export const assertFalse = (value: boolean): void => assert.strictEqual(value, false);
export const assertEquals = <T0, T1>(value0: T0, value1: T1): void => assert.strictEqual(value0, value1);
