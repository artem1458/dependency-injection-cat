import { CommandType } from './ServiceCommand';

export interface IServiceResponse<T extends ResponseType | CommandType, P> {
    type: T;
    status: ResponseStatus;
    payload: P;
}

export enum ResponseType {
    INIT = 'INIT',
    EXIT = 'EXIT',
    ERROR = 'ERROR',
}

export enum ResponseStatus {
    OK = 'OK',
    NOT_OK = 'NOT_OK',
}
