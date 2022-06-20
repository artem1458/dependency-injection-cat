import { FSRequestType } from './FSRequestType';

export interface IDeleteFilesRequest {
    type: FSRequestType.DELETE;
    paths: string[];
}

export interface IAddFilesRequest {
    type: FSRequestType.ADD;
    files: [path: string, content: string][];
}

export interface IClearFilesRequest {
    type: FSRequestType.CLEAR;
}

export type FileSystemRequest = IAddFilesRequest | IDeleteFilesRequest | IClearFilesRequest;
