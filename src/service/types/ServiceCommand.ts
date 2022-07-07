import { IBatchFileSystemCommand } from './file_system/FileSystemCommands';

export interface IServiceCommand<T extends CommandType, P = null> {
    type: T;
    payload: P;
}

export enum CommandType {
    FS = 'FS',
    PROCESS_FILES = 'PROCESS_FILES',
}

export type ServiceCommand =
    | IServiceCommand<CommandType.FS, IBatchFileSystemCommand>
    | IServiceCommand<CommandType.PROCESS_FILES>
