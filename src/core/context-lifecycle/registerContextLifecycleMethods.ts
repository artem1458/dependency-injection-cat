import { IContextDescriptor } from '../context/ContextRepository';
import { isContextLifecycleMethod } from './isContextLifecycleMethod';
import { registerLifecycleMethod } from './registerLifecycleMethod';
import { getLifecycleTypes } from './getLifecycleTypes';
import { isContextLifecycleArrowFunction } from './isContextLifecycleArrowFunction';
import { registerLifecycleArrowFunction } from './registerLifecycleArrowFunction';
import { LifecycleMethodsRepository } from './LifecycleMethodsRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { CompilationContext2 } from '../../compilation-context/CompilationContext2';

export const registerContextLifecycleMethods = (
    compilationContext: CompilationContext2,
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
                CompilationContext.reportError({
                    node: it,
                    filePath: contextDescriptor.absolutePath,
                    relatedContextPath: contextDescriptor.absolutePath,
                    message: 'Global Contexts does not support lifecycle methods',
                });
                return;
            }

            registerLifecycleMethod(contextDescriptor, it, lifecycles);
        } else if (isContextLifecycleArrowFunction(it)) {
            if (contextDescriptor.isGlobal) {
                CompilationContext.reportError({
                    node: it,
                    filePath: contextDescriptor.absolutePath,
                    relatedContextPath: contextDescriptor.absolutePath,
                    message: 'Global Contexts does not support lifecycle methods',
                });
                return;
            }

            registerLifecycleArrowFunction(compilationContext, contextDescriptor, it, lifecycles);
        }
    });
};
