import { TGraphEntity } from './TGraphEntity';

export interface IGraph<TEntity> {
    readonly g: Readonly<TGraphEntity<TEntity>>;

    addVertex(vertex: TEntity): void;
    hasVertex(vertex: TEntity): boolean;

    addEdges(vertex: TEntity, ...edges: Array<TEntity>): void;
    hasEdges(vertex: TEntity): boolean;
    getEdges(vertex: TEntity): Array<TEntity>;
    clearGraph(): void;
}

