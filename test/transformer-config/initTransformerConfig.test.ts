import { initTransformerConfig } from '@src/transformer-config/initTransformerConfig';
import { ITransformerConfig, transformerConfig } from '@src/transformer-config';

describe('initTransformerConfig tests', () => {
    it('initTransformerConfig should init configuration only once, and correctly set first configuration', () => {
        //Given
        const firstConfig: ITransformerConfig = {
            configPattern: 'pattern',
        };

        const anotherConfig_0: ITransformerConfig = {
            configPattern: 'anotherPattern_0',
        };

        const anotherConfig_1: ITransformerConfig = {
            configPattern: 'anotherPattern_1',
        };

        //When
        initTransformerConfig(firstConfig);
        initTransformerConfig(anotherConfig_0);
        initTransformerConfig(anotherConfig_1);

        //Then
        expect(transformerConfig).toEqual(firstConfig);
    });
});
