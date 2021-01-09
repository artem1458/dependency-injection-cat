import ts from 'typescript';
import { IGraph } from '../../../graphs/graph';
import { AcyclicGraph } from '../../../graphs/acyclic-graph';

type TContextName = string;
type TBeanName = string;

export interface IBeanDescriptor {
    name: string;
    typeId: string;
    originalTypeName: string;
    scope: 'prototype' | 'singleton';
    node: ts.MethodDeclaration | ts.PropertyDeclaration;
}

export class BeansRepository {
    static graphRepository = new Map<TContextName, IGraph>();
    static beansDescriptorRepository = new Map<ts.MethodDeclaration | ts.PropertyDeclaration, IBeanDescriptor>();

    static registerMethodBean(
        contextName: TContextName,
        beanName: TBeanName,
        typeId: string,
        originalTypeName: string,
        scope: 'prototype' | 'singleton',
        node: ts.MethodDeclaration | ts.PropertyDeclaration
    ): void {
        const graph = this.getGraph(contextName);

        graph.addNode(beanName);

        const descriptor = new BeanDescriptor(
            beanName,
            typeId,
            originalTypeName,
            scope,
            node,
            contextName,
        );

        this.beansDescriptorRepository.set(node, descriptor);
    }

    private static getGraph(contextName: TContextName): IGraph {
        const graph = this.graphRepository.get(contextName);

        if (graph) {
            return graph;
        }

        const newGraph = new AcyclicGraph();

        this.graphRepository.set(contextName, newGraph);

        return newGraph;
    }
}

class BeanDescriptor implements IBeanDescriptor {
    constructor(
        public readonly name: string,
        public readonly typeId: string,
        public readonly originalTypeName: string,
        public readonly scope: 'prototype' | 'singleton',
        public readonly node: ts.MethodDeclaration | ts.PropertyDeclaration,
        public readonly contextName: TContextName,
    ) {}
}
