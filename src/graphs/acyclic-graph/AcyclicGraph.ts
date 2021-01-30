import { Graph } from '../graph';
import { IAcyclicGraph } from './IAcyclicGraph';

export class AcyclicGraph<TEntity> extends Graph<TEntity> implements IAcyclicGraph<TEntity> {
    getCycleVertices(): TEntity[] {
        const visited: Map<TEntity, boolean> = new Map<TEntity, boolean>();
        const stack: Map<TEntity, boolean> = new Map<TEntity, boolean>();

        const cyclicVertices: TEntity[] = [];

        this.g.forEach((edges, vertex) => {
            if (this.detectCycleForNode(vertex, visited, stack)) {
                cyclicVertices.push(vertex);
            }
        });

        return cyclicVertices;
    }

    //TODO Find out, how to correctly log cyclic dependencies
    detectCycleForNode(vertex: TEntity, visited: Map<TEntity, boolean>, stack: Map<TEntity, boolean>): boolean {
        if (!visited.get(vertex)) {
            const vertexNeighbors = this.g.get(vertex) || [];
            let hasCycle = false;

            visited.set(vertex, true);
            stack.set(vertex, true);

            vertexNeighbors.forEach(vertex => {
                if (!visited.has(vertex) && this.detectCycleForNode(vertex, visited, stack) || stack.has(vertex)) {
                    hasCycle = true;
                }
            });

            if (hasCycle) {
                return true;
            }
        }

        stack.set(vertex, false);

        return false;
    }
}
