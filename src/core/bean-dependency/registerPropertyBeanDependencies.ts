import ts from 'typescript';
import { ClassPropertyWithCallExpressionInitializer } from '../ts/types';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { DependencyResolvingError } from '../../compilation-context/messages/errors/DependencyResolvingError';
import { getNodeSourceDescriptor } from '../ts/utils/getNodeSourceDescriptor';
import { registerBeanDependenciesFromParameters } from './registerBeanDependenciesFromParameters';
import { ContextBean } from '../bean/ContextBean';
import { unwrapExpressionFromRoundBrackets } from '../ts/utils/unwrapExpressionFromRoundBrackets';

export const registerPropertyBeanDependencies = (
    compilationContext: CompilationContext,
    bean: ContextBean<ClassPropertyWithCallExpressionInitializer>
) => {
    const firstArgument = unwrapExpressionFromRoundBrackets(bean.node.initializer).arguments[0];
    const nodeSourceDescriptors = getNodeSourceDescriptor(firstArgument, compilationContext);

    if (nodeSourceDescriptors === null) {
        compilationContext.report(new DependencyResolvingError(
            'Try to use method bean instead.',
            firstArgument,
            bean.context.node,
        ));
        return;
    }

    const classDeclarations = nodeSourceDescriptors.filter(it => ts.isClassDeclaration(it.originalNode));

    if (classDeclarations.length === 0) {
        compilationContext.report(new DependencyResolvingError(
            'Can not resolve class declaration, try to use method bean instead.',
            firstArgument,
            bean.context.node,
        ));
        return;
    }

    if (classDeclarations.length > 1) {
        compilationContext.report(new DependencyResolvingError(
            `Found ${classDeclarations.length} class declarations, try to use method bean instead.`,
            firstArgument,
            bean.context.node,
        ));
        return;
    }

    const classDeclaration = classDeclarations[0].originalNode as ts.ClassDeclaration;
    const classConstructor = classDeclaration.members.find(ts.isConstructorDeclaration) ?? null;

    if (classConstructor === null) {
        return;
    }

    registerBeanDependenciesFromParameters(bean, classConstructor.parameters, compilationContext);
};
