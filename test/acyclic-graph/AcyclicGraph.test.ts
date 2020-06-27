import { spy, verify, when } from 'ts-mockito';
import { AcyclicGraph } from '@src/acyclic-graph';
import { Graph } from '@src/graph';

describe('AcyclicGraph tests', () => {
    it('should be instance of Graph', () => {
        expect(new AcyclicGraph()).toBeInstanceOf(Graph);
    });

    describe('addEdges should add edges to node, and create node, if it\'s not exist. Should throw error, when cyclic dependency detected', () => {
        it('should create node if it\'s not exist in graph', () => {
            //Given
            const acyclicGraph = new Graph();
            const instanceSpy = spy(acyclicGraph);
            when(instanceSpy.hasNode('a')).thenReturn(false);

            //When
            acyclicGraph.addEdges('a');

            //Then
            verify(instanceSpy.hasNode('a')).called();
            verify(instanceSpy.addNode('a')).once();
        });

        it('should add edges to node, and not duplicate them', () => {
            //Given
            const expected = {
                a: ['b', 'c', 'd', 'e', 'f'],
            };

            const acyclicGraph = new Graph();
            const innerGraph = {
                a: ['b', 'c'],
            };
            Object.defineProperty(acyclicGraph, '_graph', { value: innerGraph });

            //When
            acyclicGraph.addEdges('a', 'b', 'c', 'd', 'e', 'f');

            //Then
            expect(acyclicGraph.g).toEqual(expected);
        });

        it.each`
            newEdges              |     error
            ${['a', 'a']}         |     ${'Cyclic dependency detected in a'}
            ${['b', 'b']}         |     ${'Cyclic dependency detected in b'}
            ${['c', 'c']}         |     ${'Cyclic dependency detected in a'}
            ${['c', 'b', 'c']}    |     ${'Cyclic dependency detected in a'}
        `('should throw error=$error, when adding nodes with cyclic dependencies, newEdges=$newEdges', ({ newEdges,error }: { newEdges: [string], error: string }) => {
            //Given
            const acyclicGraph = new AcyclicGraph();
            const innerGraph = {
                a: ['c'],
                b: ['c'],
                c: [],
            };
            Object.defineProperty(acyclicGraph, '_graph', { value: innerGraph });

            //When
            const errorCall = () => acyclicGraph.addEdges(...newEdges);

            //Then
            expect(errorCall).toThrow(error);
        });
    });
});
