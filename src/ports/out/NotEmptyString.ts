export type NotEmptyString<X extends string> = X extends '' ? never : X;
