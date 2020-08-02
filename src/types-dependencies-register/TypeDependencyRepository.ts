import { AcyclicGraph } from '../acyclic-graph';

export class TypeDependencyRepository {
    static acyclicGraph = new AcyclicGraph();

    static addDependencies(type: string, ...dependencies: Array<string>): void {
        TypeDependencyRepository.acyclicGraph.addEdges(type, ...dependencies);
    }
}
