import sinon from 'sinon';
import glob from 'glob';
import fs from 'fs';
import { diConfigRepository } from '@src/di-config-repository';
import { ITransformerConfig } from '@src/transformer-config';
import { initDiConfigRepository } from '@src/di-config-repository/initDiConfigRepository';

let transformerConfigMock: ITransformerConfig;

jest.mock('@src/transformer-config', () => {
    transformerConfigMock = {};
    transformerConfigMock.configPattern = undefined;

    return {
        transformerConfig: transformerConfigMock,
    };
});

const configsList = [
    'config_0',
    'config_1',
];

const readFileSyncStub = sinon.stub();
readFileSyncStub.onFirstCall().returns('config_0__content');
readFileSyncStub.onSecondCall().returns('config_1__content');

const syncStub = sinon.stub().returns(configsList);

describe('initDiConfigRepository tests', () => {
    beforeEach(() => {
        transformerConfigMock.configPattern = 'mockPattern';

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
        transformerConfigMock.configPattern = configPattern;

        //When
        const errorCall = () => initDiConfigRepository();

        //Then
        expect(errorCall).toThrow('DI Config pattern is empty, please check plugin configuration');
    });

    it('should init configuration only once, and correctly add files inner to repository', () => {
        //Given
        const expectedRepository = [
            'config_0__content',
            'config_1__content',
        ];

        transformerConfigMock.configPattern = 'mockPattern';
        sinon.replace(fs, 'readFileSync', readFileSyncStub);

        //When
        initDiConfigRepository();
        initDiConfigRepository();
        initDiConfigRepository();
        initDiConfigRepository();

        //Then
        expect(diConfigRepository).toEqual(expectedRepository);

        expect(syncStub).toBeCalledOnceWithExactly('mockPattern', { absolute: true });

        expect(readFileSyncStub).toBeCalledTwice();
        expect(readFileSyncStub.getCall(0)).toBeCalledWithExactly('config_0', 'utf-8');
        expect(readFileSyncStub.getCall(1)).toBeCalledWithExactly('config_1', 'utf-8');
    });
});
