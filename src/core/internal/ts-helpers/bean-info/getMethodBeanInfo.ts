import * as ts from 'typescript';
import { getScopeValue } from './getScopeValue';
import { getQualifierValue } from './getQualifierValue';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { isBeanDecorator } from '../predicates/isBeanDecorator';
import { ICompilationBeanInfo } from './ICompilationBeanInfo';
import { EMPTY_COMPILATION_BEAN_INFO } from './constants';

export function getMethodBeanInfo(methodDeclaration: ts.MethodDeclaration): ICompilationBeanInfo {
    const bean = methodDeclaration.decorators?.find(isBeanDecorator)
        ?? CompilationContext.reportAndThrowError({
            node: methodDeclaration,
            message: 'Bean should have @Bean decorator',
        });

    const expression = bean.expression;

    if (ts.isIdentifier(expression)) {
        return EMPTY_COMPILATION_BEAN_INFO;
    }


    if (ts.isCallExpression(expression)) {
        const firstArg = expression.arguments[0];

        if (!ts.isObjectLiteralExpression(firstArg)) {
            CompilationContext.reportAndThrowError({
                message: 'Bean configuration should be an object literal',
                node: bean,
            });
        }

        return {
            qualifier: getQualifierValue(firstArg),
            scope: getScopeValue(firstArg),
        };
    }

    return EMPTY_COMPILATION_BEAN_INFO;
}
