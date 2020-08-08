import { ITransformerConfig } from './ITransformerConfig';
import { merge } from 'lodash';
import { transformerConfig } from './transformerConfig';

export const initTransformerConfig = (config?: ITransformerConfig): void => {
    merge(transformerConfig, config);
}
