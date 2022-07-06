import { CommandType } from './ServiceCommand';

export interface IServiceResponse<T extends ResponseType | CommandType> {
    type: T;
    payload: string | null;
    id: number | null;
}

export enum ResponseType {
    INIT = 'INIT',
    EXIT = 'EXIT',
    ERROR = 'ERROR',
}
