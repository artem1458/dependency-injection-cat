import { IContextDescriptor } from '../context/ContextRepository';
import { isContextLifecycleMethod } from './isContextLifecycleMethod';
import { registerLifecycleMethod } from './registerLifecycleMethod';
import { getLifecycleTypes } from './getLifecycleTypes';
import { isContextLifecycleArrowFunction } from './isContextLifecycleArrowFunction';
import { registerLifecycleArrowFunction } from './registerLifecycleArrowFunction';
import { LifecycleMethodsRepository } from './LifecycleMethodsRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getDecoratorsOnly } from '../utils/getDecoratorsOnly';

export const registerContextLifecycleMethods = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor
): void => {
    LifecycleMethodsRepository.clearBeanInfoByContextDescriptor(contextDescriptor);

    contextDescriptor.node.members.forEach(it => {
        const lifecycles = getLifecycleTypes(getDecoratorsOnly(it));

        if (lifecycles === null) {
            return;
        }

        if (isContextLifecycleMethod(it)) {
            registerLifecycleMethod(compilationContext, contextDescriptor, it, lifecycles);
        } else if (isContextLifecycleArrowFunction(compilationContext, contextDescriptor, it)) {
            registerLifecycleArrowFunction(compilationContext, contextDescriptor, it, lifecycles);
        }
    });
};
