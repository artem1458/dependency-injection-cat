import { Graph, alg } from 'graphlib';
import { BeanRepository, IBeanDescriptorWithId } from '../bean/BeanRepository';

type TContextName = string;

export class DependencyGraph {
    static readonly graph = new Graph({directed: true});

    static addNodeWithEdges(node: IBeanDescriptorWithId, ...edges: IBeanDescriptorWithId[]) {
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
                .map(beanId => BeanRepository.idToBeanDescriptorMap.get(beanId) ?? null)
                .filter((it): it is IBeanDescriptorWithId => it !== null);

            let addedDescriptorList = resultMap.get(descriptorList[0].contextName) ?? null;

            if (addedDescriptorList === null) {
                addedDescriptorList = [];
                resultMap.set(descriptorList[0].contextName, addedDescriptorList);
            }

            addedDescriptorList.push(descriptorList);
        });

        return resultMap;
    }
}
