export interface IRequester<TResponse> {
    get(url: string): Promise<TResponse>;
}
