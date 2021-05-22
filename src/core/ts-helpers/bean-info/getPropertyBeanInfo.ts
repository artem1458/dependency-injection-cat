import * as ts from 'typescript';
import { getScopeValue } from './getScopeValue';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { ClassPropertyDeclarationWithInitializer } from '../types';
import { ICompilationBeanInfo } from './ICompilationBeanInfo';

export function getPropertyBeanInfo(propertyDeclaration: ClassPropertyDeclarationWithInitializer): ICompilationBeanInfo {
    const beanCall = propertyDeclaration.initializer;

    if (beanCall.arguments.length === 0) {
        CompilationContext.reportError({
            node: beanCall.expression,
            message: 'You should pass at least 1 argument to the Bean call',
            filePath: propertyDeclaration.getSourceFile().fileName,
        });
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
        CompilationContext.reportError({
            node: secondArg,
            message: 'Argument in Bean should be object literal',
            filePath: propertyDeclaration.getSourceFile().fileName,
        });

        return {
            scope: 'singleton',
        };
    }

    return {
        scope: getScopeValue(secondArg),
    };
}
