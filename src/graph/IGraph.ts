import { TGraphEntity } from './TGraphEntity';

export interface IGraph {
    readonly g: Readonly<TGraphEntity>;

    addNode(node: string): void;
    hasNode(node: string): boolean;

    addEdges(node: string, ...edges: Array<string>): void;
    hasEdges(node: string): boolean;
    getEdges(node: string): Array<string>;
}

