import { CompilationContext } from '../../compilation-context/CompilationContext';
import { IncorrectTypeError } from '../../compilation-context/messages/errors/IncorrectTypeError';
import { DITypeFlag } from '../type-system/DITypeFlag';
import { Context } from '../context/Context';
import { BeanKind } from './BeanKind';

const UNSUPPORTED_TYPES = new Set([
    DITypeFlag.UNSUPPORTED,
    DITypeFlag.NEVER,
    DITypeFlag.UNKNOWN,
    DITypeFlag.VOID,
    DITypeFlag.UNDEFINED,
]);

export const verifyBeanTypes = (compilationContext: CompilationContext, context: Context): void => {
    const contextBeans = context.beans;

    contextBeans.forEach(bean => {
        if (bean.kind === BeanKind.LIFECYCLE_METHOD || bean.kind === BeanKind.LIFECYCLE_ARROW_FUNCTION) {
            // Lifecycle methods can return anything
            return;
        }

        if (bean.diType.isUnion) {
            compilationContext.report(new IncorrectTypeError(
                'Union type is not supported as a Bean type.',
                bean.node,
                context.node,
            ));
            contextBeans.delete(bean);
            return;
        }

        if (bean.diType.isArray) {
            compilationContext.report(new IncorrectTypeError(
                'Array type is not supported as a Bean type.',
                bean.node,
                context.node,
            ));
            contextBeans.delete(bean);
            return;
        }

        if (bean.diType.isMapStringToAny) {
            compilationContext.report(new IncorrectTypeError(
                'Map<string, any> type is not supported as a Bean type.',
                bean.node,
                context.node,
            ));
            contextBeans.delete(bean);
            return;
        }

        if (bean.diType.isSet) {
            compilationContext.report(new IncorrectTypeError(
                'Set type is not supported as a Bean type.',
                bean.node,
                context.node,
            ));
            contextBeans.delete(bean);
            return;
        }

        if (UNSUPPORTED_TYPES.has(bean.diType.typeFlag)) {
            compilationContext.report(new IncorrectTypeError(
                'Unsupported type for Bean.',
                bean.node.type ?? bean.node,
                context.node,
            ));
            contextBeans.delete(bean);
            return;
        }
    });
};
