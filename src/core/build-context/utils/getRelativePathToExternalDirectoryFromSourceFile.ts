import upath from 'upath';
import { EXTERNAL_DIRECTORY } from '../../../external/__dirname';

export const getRelativePathToExternalDirectoryFromSourceFile = (fileDirname: string): string => {
    return upath.relative(
        fileDirname,
        EXTERNAL_DIRECTORY,
    );
};
