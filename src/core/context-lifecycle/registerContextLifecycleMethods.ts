import { IContextDescriptor } from '../context/ContextRepository';
import { isContextLifecycleMethod } from './isContextLifecycleMethod';
import { registerLifecycleMethod } from './registerLifecycleMethod';
import { getLifecycleTypes } from './getLifecycleTypes';
import { isContextLifecycleArrowFunction } from './isContextLifecycleArrowFunction';
import { registerLifecycleArrowFunction } from './registerLifecycleArrowFunction';
import { LifecycleMethodsRepository } from './LifecycleMethodsRepository';

export const registerContextLifecycleMethods = (contextDescriptor: IContextDescriptor): void => {
    LifecycleMethodsRepository.clearBeanInfoByContextDescriptor(contextDescriptor);

    contextDescriptor.node.members.forEach(it => {
        const lifecycles = getLifecycleTypes(it.decorators ?? [] as any);

        if (lifecycles === null) {
            return;
        }

        if (isContextLifecycleMethod(it)) {
            registerLifecycleMethod(contextDescriptor, it, lifecycles);
        } else if (isContextLifecycleArrowFunction(it)) {
            registerLifecycleArrowFunction(contextDescriptor, it, lifecycles);
        }
    });
};
