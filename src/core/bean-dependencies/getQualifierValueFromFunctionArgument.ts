import ts from 'typescript';
import { isParameterQualifierDecorator } from '../ts-helpers/predicates/isParameterQualifierDecorator';
import { IContextDescriptor } from '../context/ContextRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { DecoratorsCountError } from '../../exceptions/compilation/errors/DecoratorsCountError';
import { IncorrectArgumentError } from '../../exceptions/compilation/errors/IncorrectArgumentError';
import { IncorrectExpressionUsageError } from '../../exceptions/compilation/errors/IncorrectExpressionUsageError';
import { IncorrectArgumentsLengthError } from '../../exceptions/compilation/errors/IncorrectArgumentsLengthError';

export function getQualifierValueFromFunctionArgument(
    compilationContext: CompilationContext,
    parameter: ts.ParameterDeclaration,
    contextDescriptor: IContextDescriptor
): string | null {
    const qualifierDecorators = parameter.decorators?.filter(isParameterQualifierDecorator) ?? [];

    if (qualifierDecorators.length === 0) {
        return null;
    }

    if (qualifierDecorators.length > 1) {
        qualifierDecorators.slice(1).forEach(it => {
            compilationContext.report(new DecoratorsCountError(
                'Only 1 @Qualifier decorator is allowed',
                it,
                contextDescriptor.node,
            ));
        });
        return null;
    }

    const decoratorExpression = qualifierDecorators[0].expression;

    if (ts.isIdentifier(decoratorExpression)) {
        compilationContext.report(new IncorrectExpressionUsageError(
            'You should call @Qualifier with a name argument.',
            qualifierDecorators[0],
            contextDescriptor.node,
        ));
        return null;
    }

    if (ts.isCallExpression(decoratorExpression)) {
        const args = decoratorExpression.arguments;

        if (args.length === 0) {
            compilationContext.report(new IncorrectArgumentsLengthError(
                null,
                decoratorExpression,
                contextDescriptor.node,
            ));
            return null;
        }

        if (args.length > 1) {
            compilationContext.report(new IncorrectArgumentsLengthError(
                null,
                decoratorExpression,
                contextDescriptor.node,
            ));
            return null;
        }

        const qualifierValue = args[0];

        if (!ts.isStringLiteral(qualifierValue)) {
            compilationContext.report(new IncorrectArgumentError(
                'Should be a plain string literal.',
                decoratorExpression,
                contextDescriptor.node,
            ));
            return null;
        }

        return qualifierValue.text;
    }

    return null;
}
