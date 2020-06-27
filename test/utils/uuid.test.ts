import { uuid } from '@src/utils/uuid';

describe('uuid test', () => {
    it('uuid should always return uniq strings with length == 32', () => {
        //When
        const values = new Array(1000).fill(null).map(uuid);

        //Then
        values.forEach((it, firstIndex) => {
            const lastIndex = values.lastIndexOf(it);

            expect(firstIndex).toBe(lastIndex);
            expect(it).toHaveLength(32);
        });
    });
});
