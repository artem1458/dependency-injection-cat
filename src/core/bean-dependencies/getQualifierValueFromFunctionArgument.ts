import ts from 'typescript';
import { isParameterQualifierDecorator } from '../ts-helpers/predicates/isParameterQualifierDecorator';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { IContextDescriptor } from '../context/ContextRepository';

export function getQualifierValueFromFunctionArgument(parameter: ts.ParameterDeclaration, contextDescriptor: IContextDescriptor): string | null {
    const qualifierDecorators = parameter.decorators?.filter(isParameterQualifierDecorator) ?? [];

    if (qualifierDecorators.length === 0) {
        return null;
    }

    if (qualifierDecorators.length > 1) {
        CompilationContext.reportError({
            node: parameter,
            message: 'Parameter Qualifier should not have more than 1 @Qualifier decorator',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });

        return null;
    }

    const decoratorExpression = qualifierDecorators[0].expression;

    if (ts.isIdentifier(decoratorExpression)) {
        CompilationContext.reportError({
            node: qualifierDecorators[0],
            message: 'You should call @Qualifier with string, when decorating parameter',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return null;
    }

    if (ts.isCallExpression(decoratorExpression)) {
        const args = decoratorExpression.arguments;

        if (args.length === 0) {
            CompilationContext.reportError({
                node: decoratorExpression,
                message: '@Qualifier should have only 1 argument',
                filePath: contextDescriptor.absolutePath,
                relatedContextPath: contextDescriptor.absolutePath,
            });
            return null;
        }

        if (args.length > 1) {
            CompilationContext.reportError({
                node: decoratorExpression,
                message: '@Qualifier should have only 1 argument',
                filePath: contextDescriptor.absolutePath,
                relatedContextPath: contextDescriptor.absolutePath,
            });
            return null;
        }

        const qualifierValue = args[0];

        if (!ts.isStringLiteral(qualifierValue)) {
            CompilationContext.reportError({
                node: decoratorExpression,
                message: 'Qualifier should be a string literal',
                filePath: contextDescriptor.absolutePath,
                relatedContextPath: contextDescriptor.absolutePath,
            });
            return null;
        }

        return qualifierValue.text;
    }

    return null;
}
