export interface IRequester<T> {
    sendRequest(message: T): void;
}
