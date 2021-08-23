import { IContextDescriptor } from '../context/ContextRepository';
import { registerLifecycleExpression } from './registerLifecycleExpression';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import { TLifecycle } from '../../external/InternalCatContext';

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
        'arrow-function',
    );
};
