import { FileSystemRequest } from './file_system/FileSystemRequest';
import { IProcessFilesRequest } from './process_files/IProcessFilesRequest';

export interface IServiceRequest<T extends CommandType, P> {
    type: T;
    payload: P;
}

export enum CommandType {
    FS = 'FS',
    PROCESS_FILES = 'PROCESS_FILES',
}

export type ServiceRequest =
    | IServiceRequest<CommandType.FS, FileSystemRequest>
    | IServiceRequest<CommandType.PROCESS_FILES, IProcessFilesRequest>
