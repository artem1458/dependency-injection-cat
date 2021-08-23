import ts from 'typescript';
import { IContextDescriptor } from '../context/ContextRepository';
import { registerLifecycleExpression } from './registerLifecycleExpression';
import { TLifecycle } from '../../external/InternalCatContext';

export const registerLifecycleMethod = (contextDescriptor: IContextDescriptor, node: ts.MethodDeclaration, lifecycles: Set<TLifecycle>): void => {
    const classMemberName = node.name.getText();

    registerLifecycleExpression(
        contextDescriptor,
        classMemberName,
        node,
        lifecycles,
        'method',
    );
};
