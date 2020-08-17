import { spy, verify, when } from 'ts-mockito';
import { Graph } from '@src/graphs/graph/Graph';

describe('Graph tests', () => {
    describe('addNode should add node to graph', () => {
        it('should add empty node to graph', () => {
            //Given
            const expected = {
                a: [],
            };

            const graph = new Graph();

            //When
            graph.addNode('a');

            //Then
            expect(graph.g).toEqual(expected);
        });

        it('should not rewrite exist node', () => {
            //Given
            const expected = {
                a: ['b', 'c', 'd'],
            };

            const graph = new Graph();
            const innerGraph = {
                a: ['b', 'c', 'd'],
            };
            Object.defineProperty(graph, '_graph', { value: innerGraph })

            //When
            graph.addNode('a');

            //Then
            expect(graph.g).toEqual(expected);
        });
    });

    it.each`
        node        |       expected
        ${'a'}      |       ${true}
        ${'b'}      |       ${false}
    `('hasNode should check, if there is node in graph, should return $expected, for node=$node', ({ node, expected }) => {
        //Given
        const graph = new Graph();
        graph.addNode('a');

        //When
        const actual = graph.hasNode(node);

        //Then
        expect(actual).toEqual(expected);
    });

    describe('addEdges should add edges to node, and create node, if it\'s not exist', () => {
        it('should create node if it\'s not exist in graph', () => {
            //Given
            const graph = new Graph();
            const instanceSpy = spy(graph);
            when(instanceSpy.hasNode('a')).thenReturn(false);

            //When
            graph.addEdges('a');

            //Then
            verify(instanceSpy.hasNode('a')).called();
            verify(instanceSpy.addNode('a')).once();
        });

        it('should add edges to node, and not duplicate them, also should add empty nodes to graph with dependencies', () => {
            //Given
            const expected = {
                a: ['b', 'c', 'd', 'e', 'f'],
                b: [],
                c: [],
                d: [],
                e: [],
                f: [],
            };

            const graph = new Graph();
            const innerGraph = {
                a: ['b', 'c'],
            };
            Object.defineProperty(graph, '_graph', { value: innerGraph });

            //When
            graph.addEdges('a', 'b', 'c', 'd', 'e', 'f');

            //Then
            expect(graph.g).toEqual(expected);
        });
    });

    it.each`
        node        |       expected
        ${'a'}      |       ${true}
        ${'b'}      |       ${false}
    `('hasEdges should check, if there is edges in node, should return $expected, for node=$node', ({ node, expected }) => {
        //Given
        const graph = new Graph();
        const innerGraph = {
            a: ['b', 'c'],
            b: [],
        }
        Object.defineProperty(graph, '_graph', { value: innerGraph });

        //When
        const actual = graph.hasEdges(node);

        //Then
        expect(actual).toEqual(expected);
    });

    describe('getEdges', () => {
        it('should return list edges of node, when node exist', () => {
            //Given
            const graph = new Graph();
            const innerGraph = {
                a: ['b', 'c'],
            }
            Object.defineProperty(graph, '_graph', { value: innerGraph });

            //When
            const actual = graph.getEdges('a');

            //Then
            expect(actual).toEqual(innerGraph.a);
        });

        it('should return empty list, when node not exist in graph', () => {
            //Given
            const graph = new Graph();
            const innerGraph = {}
            Object.defineProperty(graph, '_graph', { value: innerGraph });

            //When
            const actual = graph.getEdges('a');

            //Then
            expect(actual).toEqual([]);
        });
    });
});
