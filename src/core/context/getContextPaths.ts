import glob from 'glob';
import { diConfig } from '../../external/config';
import { GITHUB_REPO_LINK } from '../../exceptions/constants';

export const getContextPaths = (): Array<string> => {
    const {diConfigPattern, ignorePatterns} = diConfig;

    if (!diConfigPattern) {
        throw new Error(`You forgot define diConfig pattern. Please check configuration guide ${GITHUB_REPO_LINK}`);
    }

    return glob.sync(diConfigPattern, {absolute: true, ignore: ignorePatterns});
};
