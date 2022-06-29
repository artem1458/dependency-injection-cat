import { FileSystemCommand } from './file_system/FileSystemCommand';
import { IProcessFilesCommand } from './process_files/IProcessFilesCommand';
import { RestartCommand } from './restart/RestartCommand';

export interface IServiceCommand<T extends CommandType, P> {
    type: T;
    payload: P;
}

export enum CommandType {
    FS = 'FS',
    PROCESS_FILES = 'PROCESS_FILES',
    RESTART = 'RESTART',
}

export type ServiceCommand =
    | IServiceCommand<CommandType.FS, FileSystemCommand>
    | IServiceCommand<CommandType.PROCESS_FILES, IProcessFilesCommand>
    | IServiceCommand<CommandType.RESTART, RestartCommand>
