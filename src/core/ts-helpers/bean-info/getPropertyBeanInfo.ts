import * as ts from 'typescript';
import { getScopeValue } from './getScopeValue';
import { ClassPropertyDeclarationWithInitializer } from '../types';
import { ICompilationBeanInfo } from './ICompilationBeanInfo';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { IncorrectArgumentsLengthError } from '../../../exceptions/compilation/errors/IncorrectArgumentsLengthError';
import { IContextDescriptor } from '../../context/ContextRepository';
import { IncorrectArgumentError } from '../../../exceptions/compilation/errors/IncorrectArgumentError';

export function getPropertyBeanInfo(
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    propertyDeclaration: ClassPropertyDeclarationWithInitializer
): ICompilationBeanInfo {
    const beanCall = propertyDeclaration.initializer;

    if (beanCall.arguments.length === 0) {
        compilationContext.report(new IncorrectArgumentsLengthError(
            null,
            propertyDeclaration,
            contextDescriptor.node,
        ));

        return {
            scope: 'singleton',
        };
    }

    const secondArg = beanCall.arguments[1];

    if (secondArg === undefined) {
        return {
            scope: 'singleton',
        };
    }

    if (!ts.isObjectLiteralExpression(secondArg)) {
        compilationContext.report(new IncorrectArgumentError(
            'Configuration object should be an object literal.',
            secondArg,
            contextDescriptor.node,
        ));

        return {
            scope: 'singleton',
        };
    }

    return {
        scope: getScopeValue(compilationContext, contextDescriptor, secondArg),
    };
}
