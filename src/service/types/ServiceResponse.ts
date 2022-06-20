export interface IServiceResponseWithoutPayload {
    status: ResponseStatus;
}
export interface IServiceResponse<T extends object> {
    status: ResponseStatus;
    payload: T;
}

export enum ResponseStatus {
    OK = 'OK',
    NOT_OK = 'NOT_OK',
}

export type ServiceResponse<T extends object = object> = IServiceResponseWithoutPayload | IServiceResponse<T>;
