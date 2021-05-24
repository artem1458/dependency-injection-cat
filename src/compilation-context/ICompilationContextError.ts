import ts from 'typescript';

export interface ICompilationContextError {
    message: string;
    node: ts.Node;
    filePath: string;
}
export interface ICompilationContextErrorWithMultipleNodes {
    message: string;
    nodes: ts.Node[];
    filePath: string | undefined;
}
