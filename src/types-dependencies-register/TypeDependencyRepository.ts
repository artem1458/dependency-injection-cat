import { AcyclicGraph } from '../graphs/acyclic-graph';

export class TypeDependencyRepository {
    static graph = new AcyclicGraph();

    static addDependencies(type: string, ...dependencies: Array<string>): void {
        TypeDependencyRepository.graph.addVertices(type, ...dependencies);
    }

    static getDependencies(type: string): Array<string> {
        return TypeDependencyRepository.graph.getVertices(type);
    }

    static clearRepository(): void {
        TypeDependencyRepository.graph.clearGraph();
    }
}
