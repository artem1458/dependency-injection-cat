import sinon from 'sinon';
import glob from 'glob';
import { ITransformerConfig } from '@src/transformer-config';
import { initDiConfigRepository } from '@src/di-config-repository/initDiConfigRepository';

let transformerConfigMock: ITransformerConfig;

jest.mock('@src/transformer-config', () => {
    transformerConfigMock = {};
    transformerConfigMock.diConfigPattern = undefined;

    return {
        transformerConfig: transformerConfigMock,
    };
});

const configsList = [
    'config_0',
    'config_1',
];

const syncStub = sinon.stub().returns(configsList);

describe('initDiConfigRepository tests', () => {
    beforeEach(() => {
        transformerConfigMock.diConfigPattern = 'mockPattern';

        sinon.restore();
        sinon.replace(glob, 'sync', syncStub);
    });

    it.each`
        configPattern
        ${undefined}
        ${null}
        ${''}
    `('should throw error, when search pattern is empty, configPattern - $configPattern', ({ configPattern }) => {
        //Given
        transformerConfigMock.diConfigPattern = configPattern;

        //When
        const errorCall = () => initDiConfigRepository();

        //Then
        expect(errorCall).toThrow('DI Config pattern is empty, please check plugin configuration');
    });
});
