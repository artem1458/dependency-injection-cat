import { Bean, BeforeDestruct, CatContext, PostConstruct } from 'dependency-injection-cat';
import { Subscriber } from './Subscriber';
import { IContextLifecycle } from './IContextLifecycle';

export class ContextLifecycle extends CatContext<IContextLifecycle> {
    subscriber = Bean(Subscriber);

    @PostConstruct
    postConstructMethod(subscriber: Subscriber) {
        subscriber.subscribe('subscribe from method');
    }

    @BeforeDestruct
    beforeDestructMethod(subscriber: Subscriber) {
        subscriber.unSubscribe('unsubscribe from method');
    }

    @PostConstruct
        postConstructArrowFunction = (subscriber: Subscriber) => {
            subscriber.subscribe('subscribe from arrow function');
        };

    @BeforeDestruct
        beforeDestructArrowFunction = (subscriber: Subscriber) => {
            subscriber.unSubscribe('unsubscribe from arrow function');
        };

    @PostConstruct
    @BeforeDestruct
    allLifecyclesMethod(subscriber: Subscriber) {
        subscriber.callInAllLifecycleMethods('all lifecycles method');
    }

    @PostConstruct
    @BeforeDestruct
        allLifecyclesArrowFunction = (subscriber: Subscriber) => {
            subscriber.callInAllLifecycleMethods('all lifecycles arrow function');
        };
}
