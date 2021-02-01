import ts from 'typescript';

export interface INodeSourceDescriptor {
    name: string;
    path: string;
    node: ts.Node | null;
}
