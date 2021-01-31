import glob from 'glob';
import { transformerConfig } from '../../external/transformers/config';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { GITHUB_REPO_LINK } from '../../exceptions/constants';

export const getContextPaths = (): Array<string> => {
    const { diConfigPattern, ignorePatterns } = transformerConfig;

    if (!diConfigPattern) {
        CompilationContext
            .reportAndThrowErrorMessage(`You forgot define diConfig pattern. Please check configuration guide ${GITHUB_REPO_LINK}`);
    }

    return glob.sync(diConfigPattern, { absolute: true, ignore: ignorePatterns });
};
