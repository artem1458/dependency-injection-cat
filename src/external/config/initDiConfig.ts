import { isArray, mergeWith } from 'lodash';
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

    mergeWith(diConfig, config, (objValue, srcValue) => {
        if (isArray(objValue)) {
            return objValue.concat(srcValue);
        }

        return undefined;
    });
};
