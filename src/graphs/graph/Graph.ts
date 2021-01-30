import { IGraph } from './IGraph';
import { TGraphEntity } from './TGraphEntity';

export class Graph<TEntity> implements IGraph<TEntity> {
    protected _graph: TGraphEntity<TEntity> = new Map<TEntity, Array<TEntity>>();

    get g(): Readonly<TGraphEntity<TEntity>> {
        return this._graph;
    }

    addVertex(vertex: TEntity): void {
        if (!this.hasVertex(vertex)) {
            this._graph.set(vertex, []);
        }
    }

    hasVertex(vertex: TEntity): boolean {
        return this.g.has(vertex);
    }

    addEdges(vertex: TEntity, ...newEdges: Array<TEntity>): void {
        this.addVertex(vertex);

        const existEdges = this._graph.get(vertex) || [];

        newEdges.forEach(newEdge => {
            this.addVertex(newEdge);

            if (!existEdges.includes(newEdge)) {
                existEdges.push(newEdge);
            }
        });
    }

    hasEdges(vertex: TEntity): boolean {
        const list = this.g.get(vertex) || [];

        return list.length > 0;
    }

    getEdges(vertex: TEntity): Array<TEntity> {
        return this.g.get(vertex) || [];
    }

    clearGraph(): void {
        this._graph.clear();
    }
}
