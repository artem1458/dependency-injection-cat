import ts from 'typescript';

export interface ICompilationContextError {
    message: string;
    node: ts.Node;
    filePath: string;
    relatedContextPath?: string;
}
export interface ICompilationContextErrorWithMultipleNodes {
    message: string;
    nodes: ts.Node[];
    filePath: string | undefined;
    relatedContextPath?: string;
}
