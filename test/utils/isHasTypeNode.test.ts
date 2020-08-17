import { Node } from 'typescript';

import { isHasTypeNode } from '@src/typescript-helpers/isHasTypeNode';

describe('isHasTypeNode tests', () => {
    it.each`
        type            |       expected
        ${undefined}    |       ${false}
        ${null}         |       ${false}
        ${{}}           |       ${true}
    `('should return $expected, when type $type', ({ type, expected }) => {
        //Given
        const node = { type } as unknown as Node;

        //When
        const actual = isHasTypeNode(node);

        //Then
        expect(actual).toEqual(expected);
    });
});
