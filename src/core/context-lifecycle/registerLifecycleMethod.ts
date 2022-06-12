import ts from 'typescript';
import { IContextDescriptor } from '../context/ContextRepository';
import { registerLifecycleExpression } from './registerLifecycleExpression';
import { TLifecycle } from '../../external/InternalCatContext';
import { CompilationContext } from '../../compilation-context/CompilationContext';

export const registerLifecycleMethod = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    node: ts.MethodDeclaration,
    lifecycles: Set<TLifecycle>
): void => {
    const classMemberName = node.name.getText();

    registerLifecycleExpression(
        compilationContext,
        contextDescriptor,
        classMemberName,
        node,
        lifecycles,
        'method',
    );
};
