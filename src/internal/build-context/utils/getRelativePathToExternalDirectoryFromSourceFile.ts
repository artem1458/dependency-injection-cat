import path from 'path';
import { EXTERNAL_DIRECTORY } from '../../../external/__dirname';

export const getRelativePathToExternalDirectoryFromSourceFile = (fileDirname: string): string => {
    return path.relative(
        fileDirname,
        EXTERNAL_DIRECTORY,
    );
};
