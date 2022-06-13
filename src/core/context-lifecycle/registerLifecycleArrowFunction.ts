import { IContextDescriptor } from '../context/ContextRepository';
import { registerLifecycleExpression } from './registerLifecycleExpression';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import { TLifecycle } from '../../external/InternalCatContext';
import { CompilationContext } from '../../compilation-context/CompilationContext';

export const registerLifecycleArrowFunction = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    node: ClassPropertyArrowFunction,
    lifecycles: Set<TLifecycle>
): void => {
    const classMemberName = node.name.getText();

    registerLifecycleExpression(
        compilationContext,
        contextDescriptor,
        classMemberName,
        node,
        lifecycles,
        'arrow-function',
    );
};
