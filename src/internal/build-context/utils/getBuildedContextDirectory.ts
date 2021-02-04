import upath from 'upath';
import { diConfig } from '../../../external/config';
import { BUILDED_CONTEXT_DIRECTORY } from '../../../external/builded-context/__dirname';
import { TsConfigProvider } from '../../ts-config-path-provider/TsConfigProvider';

export const getBuildedContextDirectory = (): string => {
    if (diConfig.compiledContextOutputDir) {
        return upath.resolve(
            upath.dirname(TsConfigProvider.tsConfigPath),
            diConfig.compiledContextOutputDir
        );
    }

    return BUILDED_CONTEXT_DIRECTORY;
};
