import { FileSystemRequest } from './file_system/IFSRequest';
import { IProcessFilesRequest } from './process_files/IProcessFilesRequest';

export interface IServiceRequest<T extends RequestType, P> {
    type: T;
    payload: P;
}

export enum RequestType {
    INIT = 'INIT',
    FS = 'FS',
    PROCESS_FILES = 'PROCESS_FILES',
}

export type ServiceRequest =
    IServiceRequest<RequestType.INIT, never>
    | IServiceRequest<RequestType.FS, FileSystemRequest>
    | IServiceRequest<RequestType.PROCESS_FILES, IProcessFilesRequest>
