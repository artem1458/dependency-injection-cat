import { AcyclicGraph, IAcyclicGraph } from '../../../graphs/acyclic-graph';
import { IBeanDescriptor } from '../bean/BeanRepository';

export class DependencyGraph {
    static readonly graph: IAcyclicGraph<IBeanDescriptor> = new AcyclicGraph();
}
