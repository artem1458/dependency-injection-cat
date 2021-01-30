import { anything, spy, verify, when } from 'ts-mockito';
import { Graph, IGraph } from '../../src/graphs/graph';
import { random } from '../testUtils/random';

describe('Graph tests', () => {
    let graph: IGraph<string>;

    beforeEach(() => {
        graph = new Graph();
    });

    describe('addVertex tests', () => {
        it('should add empty vertex to graph', () => {
            //Given
            const vertex = random.nextString();
            const expected: any[] = [];

            //When
            graph.addVertex(vertex);

            //Then
            expect(graph.g.get(vertex)).toEqual(expected);
        });

        it('should not rewrite exist node', () => {
            //Given
            const vertex = random.nextString();
            const savedEdges = random.listOfString();

            graph.g.set(vertex, savedEdges);

            //When
            graph.addVertex(vertex);

            //Then
            expect(graph.g.get(vertex)).toEqual(savedEdges);
        });
    });

    describe('hasVertex tests', () => {
        it('should return false, when has no vertex', () => {
            //When
            const actual = graph.hasVertex(random.nextString());

            //Then
            expect(actual).toBe(false);
        });

        it('should return true, when graph has vertex', () => {
            //Given
            const vertex = random.nextString();

            graph.addVertex(vertex);

            //When
            const actual = graph.hasVertex(vertex);

            //Then
            expect(actual).toBe(true);
        });
    });

    describe('addEdges should add edges to node, and create node, if it\'s not exist', () => {
        it('should create node if it\'s not exist in graph', () => {
            //Given
            const vertex = random.nextString();

            const instanceSpy = spy(graph);
            when(instanceSpy.hasVertex(anything())).thenReturn(false);

            //When
            graph.addEdges(vertex);

            //Then
            verify(instanceSpy.hasVertex(vertex)).once();
            verify(instanceSpy.addVertex(vertex)).once();
        });

        it('should add edges to vertex, and not duplicate them, also should add empty ventricles to graph with empty dependencies', () => {
            //Given
            const vertex = random.nextString();
            const edges = random.listOfString(5);

            graph.addEdges(vertex, ...edges.slice(0, 2));

            //When
            graph.addEdges(vertex, ...edges);

            //Then
            expect(graph.getEdges(vertex)).toEqual(edges);
            expect(graph.hasVertex(edges[0])).toBe(true);
            expect(graph.hasVertex(edges[1])).toBe(true);
            expect(graph.hasVertex(edges[2])).toBe(true);
            expect(graph.hasVertex(edges[3])).toBe(true);
            expect(graph.hasVertex(edges[4])).toBe(true);
        });
    });

    describe('hasEdges tests', () => {
        it('should return false, when has no edges', () => {
            //Given
            const vertex = random.nextString();

            graph.addVertex(vertex);

            //When
            const actual = graph.hasEdges(vertex);

            //Then
            expect(actual).toBe(false);
        });

        it('should return true, when has edges', () => {
            //Given
            const vertex = random.nextString();

            graph.addEdges(vertex, ...random.listOfString());

            //When
            const actual = graph.hasEdges(vertex);

            //Then
            expect(actual).toBe(true);
        });
    });

    describe('getEdges tests', () => {
        it('should return list edges of vertex, when node exist', () => {
            //Given
            const vertex = random.nextString();
            const edges = random.listOfString();

            graph.addEdges(vertex, ...edges);

            //When
            const actual = graph.getEdges(vertex);

            //Then
            expect(actual).toEqual(edges);
        });

        it('should return empty list, when vertex does not exist in graph', () => {
            //When
            const actual = graph.getEdges(random.nextString());

            //Then
            expect(actual).toEqual([]);
        });
    });
});
