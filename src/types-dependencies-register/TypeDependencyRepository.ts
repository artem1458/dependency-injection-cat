import { AcyclicGraph } from '../acyclic-graph';

export class TypeDependencyRepository {
    private static graph = new AcyclicGraph();

    static addDependencies(type: string, ...dependencies: Array<string>): void {
        TypeDependencyRepository.graph.addEdges(type, ...dependencies);
    }
}
