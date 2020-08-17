import { AcyclicGraph } from '../graphs/acyclic-graph';

export class TypeDependencyRepository {
    static graph = new AcyclicGraph();

    static addDependencies(type: string, ...dependencies: Array<string>): void {
        TypeDependencyRepository.graph.addEdges(type, ...dependencies);
    }

    static getDependencies(type: string): Array<string> {
        return TypeDependencyRepository.graph.getEdges(type);
    }

    static clearRepository(): void {
        TypeDependencyRepository.graph.clearGraph();
    }
}
