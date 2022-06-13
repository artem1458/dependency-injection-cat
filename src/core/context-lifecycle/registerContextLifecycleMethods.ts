import { IContextDescriptor } from '../context/ContextRepository';
import { isContextLifecycleMethod } from './isContextLifecycleMethod';
import { registerLifecycleMethod } from './registerLifecycleMethod';
import { getLifecycleTypes } from './getLifecycleTypes';
import { isContextLifecycleArrowFunction } from './isContextLifecycleArrowFunction';
import { registerLifecycleArrowFunction } from './registerLifecycleArrowFunction';
import { LifecycleMethodsRepository } from './LifecycleMethodsRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { IncorrectUsageError } from '../../compilation-context/messages/errors/IncorrectUsageError';

export const registerContextLifecycleMethods = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor
): void => {
    LifecycleMethodsRepository.clearBeanInfoByContextDescriptor(contextDescriptor);

    contextDescriptor.node.members.forEach(it => {
        const lifecycles = getLifecycleTypes(it.decorators ?? [] as any);

        if (lifecycles === null) {
            return;
        }

        if (isContextLifecycleMethod(it)) {
            if (contextDescriptor.isGlobal) {
                compilationContext.report(new IncorrectUsageError(
                    'Global Contexts do not support lifecycle methods',
                    it,
                    contextDescriptor.node,
                ));
                return;
            }

            registerLifecycleMethod(compilationContext, contextDescriptor, it, lifecycles);
        } else if (isContextLifecycleArrowFunction(compilationContext, contextDescriptor, it)) {
            if (contextDescriptor.isGlobal) {
                compilationContext.report(new IncorrectUsageError(
                    'Global Contexts do not support lifecycle methods',
                    it,
                    contextDescriptor.node,
                ));
                return;
            }

            registerLifecycleArrowFunction(compilationContext, contextDescriptor, it, lifecycles);
        }
    });
};
