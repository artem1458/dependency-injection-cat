import glob from 'glob';
import { ConfigLoader } from '../../external/config/ConfigLoader';

export const getContextPaths = (): Array<string> => {
    const {pattern, ignorePatterns} = ConfigLoader.load();

    return glob.sync(pattern, {absolute: true, ignore: ignorePatterns});
};
