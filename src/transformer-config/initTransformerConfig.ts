import { ITransformerConfig } from './ITransformerConfig';
import { merge } from 'lodash';
import { transformerConfig } from './transformerConfig';

let initialized = false;

export const initTransformerConfig = (config?: ITransformerConfig): void => {
    if (initialized) {
        return;
    }

    initialized = true;
    merge(transformerConfig, config);
}
