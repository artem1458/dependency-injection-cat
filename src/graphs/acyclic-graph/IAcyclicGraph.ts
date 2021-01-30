import { IGraph } from '../graph';

export interface IAcyclicGraph<TEntity> extends IGraph<TEntity> {
    getCycleVertices(): TEntity[];
}
