import { transformerConfig, ITransformerConfig } from '@src/transformer-config';

describe('Transformer Config tests', () => {
    it('transformerConfig should have correct initial configuration', () => {
        //Given
        const expected: ITransformerConfig = {
            diConfigPattern: '**/*.diconfig.ts',
        };

        //When
        const actual = transformerConfig;

        //Then
        expect(actual).toEqual(expected);
    });
});
