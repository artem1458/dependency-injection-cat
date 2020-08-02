import { Graph } from '../graph';
import { IAcyclicGraph } from './IAcyclicGraph';

export class AcyclicGraph extends Graph implements IAcyclicGraph {
    addEdges(node: string, ...edges: Array<string>): void {
        super.addEdges(node, ...edges);

        this.detectCycle();
    }

    detectCycle(): void {
        const nodes = Object.keys(this.g);
        const visited: Record<string, boolean> = {};
        const stack: Record<string, boolean> = {};

        nodes.forEach(node => {
            if (this.detectCycleForNode(node, visited, stack)) {
                throw new Error(`Cyclic dependency detected in ${node}`);
            }
        });
    }

    //TODO Find out, how to correctly log cyclic dependencies
    detectCycleForNode(node: string, visited: Record<string, boolean>, stack: Record<string, boolean>): boolean {
        if (!visited[node]) {
            const nodeNeighbors = this.g[node];
            let hasCycle: boolean = false;

            visited[node] = true;
            stack[node] = true;

            nodeNeighbors.forEach(node => {
                if (!visited[node] && this.detectCycleForNode(node, visited, stack)) {
                    hasCycle = true;
                } else if (stack[node]) {
                    hasCycle = true;
                }
            });

            if (hasCycle) {
                return true;
            }
        }

        stack[node] = false;

        return false;
    }
}
