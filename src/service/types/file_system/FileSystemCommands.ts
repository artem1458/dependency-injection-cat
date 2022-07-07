import { FSCommandType } from './FSCommandType';

export interface IDeleteFilesCommand {
    type: FSCommandType.DELETE;
    paths: string[];
}

export interface IAddFilesCommand {
    type: FSCommandType.ADD;
    files: Record<string, string>;
}

export interface IBatchFileSystemCommand {
    commands: Array<IAddFilesCommand | IDeleteFilesCommand>;
}
