import { AcyclicGraph, IAcyclicGraph } from '../../src/graphs/acyclic-graph';
import { random } from '../testUtils/random';
import { Graph } from 'graphlib';

describe('AcyclicGraph tests', () => {
    let acyclicGraph: IAcyclicGraph<string>;

    beforeEach(() => {
        acyclicGraph = new AcyclicGraph();
    });

    it('should be instance of Graph', () => {
        expect(acyclicGraph).toBeInstanceOf(Graph);
    });

    it('should return list of vertices with cyclic dependencies', () => {
        //Given
        const vertex0 = 'vertex0';
        const vertex1 = 'vertex1';
        const vertex2 = 'vertex2';
        const vertex3 = 'vertex3';

        const expected = [vertex0, vertex2];

        acyclicGraph.addEdges(vertex0, ...random.shuffle([vertex1, ...random.listOfString()]));
        acyclicGraph.addEdges(vertex1, ...random.shuffle([vertex0, ...random.listOfString()]));
        acyclicGraph.addEdges(vertex2, ...random.shuffle([vertex3, ...random.listOfString()]));
        acyclicGraph.addEdges(vertex3, ...random.shuffle([vertex2, ...random.listOfString()]));

        //When
        const actual = acyclicGraph.getCycleVertices();

        //Then
        expect(actual).toEqual(expected);
    });

    it('should return empty list when no cyclic dependencies', () => {
        //Given
        const vertex0 = 'vertex0';
        const vertex1 = 'vertex1';
        const vertex2 = 'vertex2';
        const vertex3 = 'vertex3';

        const expected: any[] = [];

        acyclicGraph.addEdges(vertex0, ...random.listOfString());
        acyclicGraph.addEdges(vertex1, ...random.listOfString());
        acyclicGraph.addEdges(vertex2, ...random.listOfString());
        acyclicGraph.addEdges(vertex3, ...random.listOfString());

        //When
        const actual = acyclicGraph.getCycleVertices();

        //Then
        expect(actual).toEqual(expected);
    });
});
