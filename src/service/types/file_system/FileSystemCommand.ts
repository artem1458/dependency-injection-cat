import { FSCommandType } from './FSCommandType';

export interface IDeleteFilesCommand {
    type: FSCommandType.DELETE;
    paths: string[];
}

export interface IAddFilesCommand {
    type: FSCommandType.ADD;
    files: [path: string, content: string][];
}

export interface IClearFilesCommand {
    type: FSCommandType.CLEAR;
}

export type FileSystemCommand = IAddFilesCommand | IDeleteFilesCommand | IClearFilesCommand;
