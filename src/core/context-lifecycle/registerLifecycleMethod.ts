import ts from 'typescript';
import { IContextDescriptor } from '../context/ContextRepository';
import { TLifecycle } from './LifecycleMethodsRepository';
import { registerLifecycleExpression } from './registerLifecycleExpression';

export const registerLifecycleMethod = (contextDescriptor: IContextDescriptor, node: ts.MethodDeclaration, lifecycles: Set<TLifecycle>): void => {
    const classMemberName = node.name.getText();

    registerLifecycleExpression(
        contextDescriptor,
        classMemberName,
        node,
        lifecycles,
    );
};
