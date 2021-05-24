import { isArray, mergeWith, get } from 'lodash';
import { IDiConfig } from './IDiConfig';
import { diConfig } from './diConfig';
import { logLogo } from '../../core/transformers/logLogo';

let wasInitialized = false;

export const initDiConfig = (config?: IDiConfig): void => {
    if (wasInitialized) {
        return;
    }
    wasInitialized = true;

    if (!config?.disableLogoPrint) {
        logLogo();
    }

    if (get(config, 'compiledContextOutputDir') !== undefined) {
        console.error('compiledContextOutputDir DI-Cat config option is now deprecated and not used anymore');
    }

    mergeWith(diConfig, config, (objValue, srcValue) => {
        if (isArray(objValue)) {
            return objValue.concat(srcValue);
        }

        return undefined;
    });
};
