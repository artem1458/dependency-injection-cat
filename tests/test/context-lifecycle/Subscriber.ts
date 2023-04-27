import sinon from 'sinon';

export class Subscriber {
    subscribe = sinon.spy();
    unSubscribe = sinon.spy();
    callInAllLifecycleMethods = sinon.spy();
}
