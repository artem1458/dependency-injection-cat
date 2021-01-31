import * as ts from 'typescript';
import { getScopeValue } from './getScopeValue';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { isBeanDecorator } from '../predicates/isBeanDecorator';
import { ICompilationBeanInfo } from './ICompilationBeanInfo';

export const getMethodBeanInfo = (methodDeclaration: ts.MethodDeclaration): ICompilationBeanInfo => {
    const bean = methodDeclaration.decorators?.find(isBeanDecorator) ?? null;
    const qualifier = methodDeclaration.name.getText();

    if (bean === null) {
        CompilationContext.reportError({
            node: methodDeclaration,
            message: 'Bean should have @Bean decorator',
        });

        return {
            scope: 'singleton',
            qualifier,
        };
    }

    const expression = bean.expression;

    if (ts.isIdentifier(expression)) {
        return {
            scope: 'singleton',
            qualifier,
        };
    }

    if (ts.isCallExpression(expression)) {
        const firstArg = expression.arguments[0];

        if (!ts.isObjectLiteralExpression(firstArg)) {
            CompilationContext.reportError({
                message: 'Bean configuration should be an object literal',
                node: bean,
            });

            return {
                scope: 'singleton',
                qualifier,
            };
        }

        return {
            qualifier,
            scope: getScopeValue(firstArg),
        };
    }

    return {
        scope: 'singleton',
        qualifier: methodDeclaration.name.getText(),
    };
};
