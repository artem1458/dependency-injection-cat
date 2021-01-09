import { TGraphEntity } from './TGraphEntity';

export interface IGraph {
    readonly g: Readonly<TGraphEntity>;

    addNode(node: string): void;
    hasNode(node: string): boolean;

    addVertices(node: string, ...edges: Array<string>): void;
    hasVertices(node: string): boolean;
    getVertices(node: string): Array<string>;
    clearGraph(): void;
}

