import { get, isArray, mergeWith } from 'lodash';
import { IDiConfig } from './IDiConfig';
import { diConfig } from './diConfig';
import { logLogo } from '../../core/transformers/logLogo';
import chalk from 'chalk';

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
        console.warn(chalk.red('DI-Cat config option "compiledContextOutputDir" is now deprecated and not used anymore'));
    }

    mergeWith(diConfig, config, (objValue, srcValue) => {
        if (isArray(objValue)) {
            return objValue.concat(srcValue);
        }

        return undefined;
    });
};
