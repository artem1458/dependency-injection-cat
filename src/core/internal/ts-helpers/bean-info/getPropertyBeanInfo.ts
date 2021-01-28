import * as ts from 'typescript';
import { getQualifierValue } from './getQualifierValue';
import { getScopeValue } from './getScopeValue';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { ClassPropertyDeclarationWithInitializer } from '../types';
import { ICompilationBeanInfo } from './ICompilationBeanInfo';
import { EMPTY_COMPILATION_BEAN_INFO } from './constants';

export function getPropertyBeanInfo(propertyDeclaration: ClassPropertyDeclarationWithInitializer): ICompilationBeanInfo {
    const beanCall = propertyDeclaration.initializer;

    if (beanCall.arguments.length === 0) {
        CompilationContext.reportError({
            node: beanCall.expression,
            message: 'You should pass at least 1 argument to the Bean call'
        });
    }

    const secondArg = beanCall.arguments[1];

    if (secondArg === undefined) {
        return EMPTY_COMPILATION_BEAN_INFO;
    }

    if (!ts.isObjectLiteralExpression(secondArg)) {
        CompilationContext.reportError({
            node: secondArg,
            message: 'Argument in bean should be object literal',
        });

        return EMPTY_COMPILATION_BEAN_INFO;
    }

    return {
        qualifier: getQualifierValue(secondArg),
        scope: getScopeValue(secondArg),
    };
}
