import ts from 'typescript';
import { IBeanDescriptor } from '../bean/BeansRepository';
import { isParameterQualifierDecorator } from '../ts-helpers/predicates/isParameterQualifierDecorator';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getParameterType } from './getParameterType';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';

export const registerMethodBeanDependencies = (descriptor: IBeanDescriptor<ts.MethodDeclaration>) => {
    const parameters = descriptor.node.parameters;

    parameters.forEach(parameter => {
        const qualifier = getQualifierValue(parameter);
        const type = getParameterType(parameter);

        if (type === null) {
            CompilationContext.reportError({
                node: parameter,
                message: 'Can\'t qualify type of bean parameter',
            });
            return;
        }

        BeanDependenciesRepository.registerBeanDependency(
            descriptor,
            {
                node: parameter,
                contextName: descriptor.contextName,
                originalTypeName: type.originalTypeName,
                type: type.typeId,
                parameterName: parameter.name.getText(),
                qualifier,
            }
        );
    });
};

function getQualifierValue(parameter: ts.ParameterDeclaration): string | null {
    const qualifierDecorators = parameter.decorators?.filter(isParameterQualifierDecorator) ?? [];

    if (qualifierDecorators.length === 0) {
        return null;
    }

    if (qualifierDecorators.length > 1) {
        CompilationContext.reportError({
            node: parameter,
            message: 'Parameter Qualifier should not have more than 1 @Qualifier decorator'
        });

        return null;
    }

    const decoratorExpression = qualifierDecorators[0].expression;

    if (ts.isIdentifier(decoratorExpression)) {
        CompilationContext.reportError({
            node: qualifierDecorators[0],
            message: 'You should call @Qualifier with string, when decorating parameter',
        });
        return null;
    }

    if (ts.isCallExpression(decoratorExpression)) {
        const args = decoratorExpression.arguments;

        if (args.length === 0) {
            CompilationContext.reportError({
                node: decoratorExpression,
                message: '@Qualifier should have only 1 argument',
            });
            return null;
        }

        if (args.length > 1) {
            CompilationContext.reportError({
                node: decoratorExpression,
                message: '@Qualifier should have only 1 argument',
            });
            return null;
        }

        const qualifierValue = args[0];

        if (!ts.isStringLiteral(qualifierValue)) {
            CompilationContext.reportError({
                node: decoratorExpression,
                message: 'Qualifier should be a string literal',
            });
            return null;
        }

        if (qualifierValue.text === '') {
            CompilationContext.reportError({
                node: decoratorExpression,
                message: 'Qualifier should not be empty string'
            });
        }

        return qualifierValue.text;
    }

    return null;
}
