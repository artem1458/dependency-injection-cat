export interface ICompilationContextError {
    path: string;
    errorMessage: string;
    nodePosition: [number, number];
}
