import ts from 'typescript';

export interface ICompilationContextError {
    message: string;
    node: ts.Node
}
