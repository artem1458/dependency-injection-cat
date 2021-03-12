import { isArray, mergeWith } from 'lodash';
import { IDiConfig } from './IDiConfig';
import { diConfig } from './diConfig';

let wasInitialized = false;

export const initDiConfig = (config?: IDiConfig): void => {
    if (wasInitialized) {
        return;
    }
    wasInitialized = true;

    mergeWith(diConfig, config, (objValue, srcValue) => {
        if (isArray(objValue)) {
            return objValue.concat(srcValue);
        }

        return undefined;
    });
};
