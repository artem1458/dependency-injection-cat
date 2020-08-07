import { uniqId } from '@src/utils/uniqId';

describe('uniqId test', () => {
    it('uniqId should always return uniq strings with length == 32', () => {
        //When
        const values = new Array(1000).fill(null).map(uniqId);

        //Then
        values.forEach((it, firstIndex) => {
            const lastIndex = values.lastIndexOf(it);

            expect(firstIndex).toBe(lastIndex);
            expect(it).toHaveLength(16);
        });
    });
});
