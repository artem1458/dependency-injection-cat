import { isArray, mergeWith } from 'lodash';
import { ITransformerConfig } from './ITransformerConfig';
import { transformerConfig } from './transformerConfig';

let wasInitialized = false;

export const initTransformerConfig = (config?: ITransformerConfig): void => {
    if (wasInitialized) {
        return;
    }
    wasInitialized = true;

    mergeWith(transformerConfig, config, (objValue, srcValue) => {
        if (isArray(objValue)) {
            return objValue.concat(srcValue);
        }

        return undefined;
    });
};
