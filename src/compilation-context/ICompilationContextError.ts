import ts from 'typescript';

export interface ICompilationContextError {
    message: string;
    node: ts.Node;
}
export interface ICompilationContextErrorWithMultipleNodes {
    message: string;
    nodes: ts.Node[];
}
