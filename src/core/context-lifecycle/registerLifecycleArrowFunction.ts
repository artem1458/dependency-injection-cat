import { IContextDescriptor } from '../context/ContextRepository';
import { TLifecycle } from './LifecycleMethodsRepository';
import { registerLifecycleExpression } from './registerLifecycleExpression';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';

export const registerLifecycleArrowFunction = (
    contextDescriptor: IContextDescriptor,
    node: ClassPropertyArrowFunction,
    lifecycles: Set<TLifecycle>
): void => {
    const classMemberName = node.name.getText();

    registerLifecycleExpression(
        contextDescriptor,
        classMemberName,
        node,
        lifecycles,
    );
};
