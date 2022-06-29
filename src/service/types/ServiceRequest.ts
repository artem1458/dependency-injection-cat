import { FileSystemRequest } from './file_system/FileSystemRequest';
import { IProcessFilesRequest } from './process_files/IProcessFilesRequest';
import { RestartRequest } from './restart/RestartRequest';

export interface IServiceRequest<T extends CommandType, P> {
    type: T;
    payload: P;
}

export enum CommandType {
    FS = 'FS',
    PROCESS_FILES = 'PROCESS_FILES',
    RESTART = 'RESTART',
}

export type ServiceRequest =
    | IServiceRequest<CommandType.FS, FileSystemRequest>
    | IServiceRequest<CommandType.PROCESS_FILES, IProcessFilesRequest>
    | IServiceRequest<CommandType.RESTART, RestartRequest>
