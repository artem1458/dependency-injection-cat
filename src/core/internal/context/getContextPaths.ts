import glob from 'glob';
import { transformerConfig } from '../../external/transformers/config';
import { EmptyDIConfigPattern } from '../../exceptions/compilation/EmptyDIConfigPattern';

export const getContextPaths = (): Array<string> => {
    const { diConfigPattern, ignorePatterns } = transformerConfig;

    if (!diConfigPattern) {
        throw new EmptyDIConfigPattern();
    }

    return glob.sync(diConfigPattern, { absolute: true, ignore: ignorePatterns });
};
