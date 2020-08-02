export interface IInterface {
    a: string
}

export interface BB<T> {
    b: T;
}

export interface CC<T> {
    c: BB<T>;
}
