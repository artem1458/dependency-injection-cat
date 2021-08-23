import { container } from 'dependency-injection-cat';
import { IContextLifecycle } from './IContextLifecycle';
import { assertEquals, assertTrue } from '../assertions';

describe('ContextLifecycleTests', () => {
    afterEach(() => {
        container.clearContext({
            name: 'ContextLifecycle',
        });
    });

    it('should subscribe subscriber when initializing context in correct order from method and arrow function', () => {
        //When
        const context = container.initContext<IContextLifecycle>({
            name: 'ContextLifecycle',
        });

        //Then
        const { subscriber } = context.getBeans();

        assertEquals(subscriber.subscribe.callCount, 2);
        assertEquals(subscriber.unSubscribe.callCount, 0);
        assertTrue(subscriber.subscribe.getCall(0).calledWithExactly('subscribe from method'));
        assertTrue(subscriber.subscribe.getCall(1).calledWithExactly('subscribe from arrow function'));
    });

    it('should subscribe subscriber when initializing context, and unsubscribe when clearing context for method and arrow functions', () => {
        //When
        const context = container.initContext<IContextLifecycle>({
            name: 'ContextLifecycle',
        });

        //Then
        const { subscriber } = context.getBeans();

        assertEquals(subscriber.subscribe.callCount, 2);
        assertEquals(subscriber.unSubscribe.callCount, 0);
        assertTrue(subscriber.subscribe.getCall(0).calledWithExactly('subscribe from method'));
        assertTrue(subscriber.subscribe.getCall(1).calledWithExactly('subscribe from arrow function'));

        //When
        container.clearContext({
            name: 'ContextLifecycle'
        });

        //Then
        assertEquals(subscriber.subscribe.callCount, 2);
        assertEquals(subscriber.unSubscribe.callCount, 2);
        assertTrue(subscriber.unSubscribe.getCall(0).calledWithExactly('unsubscribe from method'));
        assertTrue(subscriber.unSubscribe.getCall(1).calledWithExactly('unsubscribe from arrow function'));
    });

    it('function decorated with all lifecycle methods should be called in all lifecycle methods method and arrow functions', () => {
        //When
        const context = container.initContext<IContextLifecycle>({
            name: 'ContextLifecycle',
        });

        //Then
        const { subscriber } = context.getBeans();

        assertEquals(subscriber.callInAllLifecycleMethods.callCount, 2);
        assertTrue(subscriber.callInAllLifecycleMethods.getCall(0).calledWithExactly('all lifecycles method'));
        assertTrue(subscriber.callInAllLifecycleMethods.getCall(1).calledWithExactly('all lifecycles arrow function'));

        //When
        container.clearContext({
            name: 'ContextLifecycle'
        });

        //Then
        assertEquals(subscriber.callInAllLifecycleMethods.callCount, 4);
        assertTrue(subscriber.callInAllLifecycleMethods.getCall(2).calledWithExactly('all lifecycles method'));
        assertTrue(subscriber.callInAllLifecycleMethods.getCall(3).calledWithExactly('all lifecycles arrow function'));
    });
});
