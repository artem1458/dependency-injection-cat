import { diConfig } from '../../../external/transformers/config';
import { BUILDED_CONTEXT_DIRECTORY } from '../../../external/builded-context/__dirname';

export const getBuildedContextDirectory = (): string => {
    return diConfig.compiledContextOutputDir ?? BUILDED_CONTEXT_DIRECTORY;
};
