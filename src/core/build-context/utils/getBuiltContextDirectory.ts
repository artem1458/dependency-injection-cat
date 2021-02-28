import upath from 'upath';
import { diConfig } from '../../../external/config';
import { BUILT_CONTEXT_DIRECTORY } from '../../../external/built-context/__dirname';
import { TsConfigProvider } from '../../ts-config-path-provider/TsConfigProvider';

export const getBuiltContextDirectory = (): string => {
    if (diConfig.compiledContextOutputDir) {
        return upath.resolve(
            upath.dirname(TsConfigProvider.tsConfigPath),
            diConfig.compiledContextOutputDir
        );
    }

    return BUILT_CONTEXT_DIRECTORY;
};
