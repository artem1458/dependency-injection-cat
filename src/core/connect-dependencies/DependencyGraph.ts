import { alg, Graph } from 'graphlib';
import { BeanRepository, IBeanDescriptorWithId } from '../bean/BeanRepository';
import { IContextDescriptor } from '../context/ContextRepository';

type TContextName = string;

export class DependencyGraph {
    private static graph = new Graph({directed: true});

    static addNodeWithEdges(node: IBeanDescriptorWithId, edges: IBeanDescriptorWithId[]) {
        this.graph.setNodes(
            [
                node.id,
                ...edges.map(it => it.id),
            ]
        );

        edges.forEach(edge => this.graph.setEdge(node.id, edge.id));
    }

    static getCycle(): Map<TContextName, IBeanDescriptorWithId[][]> {
        const cycleIds = alg.findCycles(this.graph);

        const resultMap = new Map<TContextName, IBeanDescriptorWithId[][]>();

        cycleIds.forEach(list => {
            const descriptorList = list
                .map(beanId => BeanRepository.beanIdToBeanDescriptorMap.get(beanId) ?? null)
                .filter((it): it is IBeanDescriptorWithId => it !== null);

            let addedDescriptorList = resultMap.get(descriptorList[0].contextDescriptor.name) ?? null;

            if (addedDescriptorList === null) {
                addedDescriptorList = [];
                resultMap.set(descriptorList[0].contextDescriptor.name, addedDescriptorList);
            }

            addedDescriptorList.push(descriptorList);
        });

        return resultMap;
    }

    static clearByContextDescriptor(contextDescriptor: IContextDescriptor): void {
        (BeanRepository.contextIdToBeanDescriptorsMap.get(contextDescriptor.id) ?? []).forEach(descriptor => {
            this.graph.removeNode(descriptor.id);
        });
    }

    static clear(): void {
        this.graph = new Graph({directed: true});
    }
}
