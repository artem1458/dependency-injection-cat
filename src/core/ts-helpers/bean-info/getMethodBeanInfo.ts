import * as ts from 'typescript';
import { getScopeValue } from './getScopeValue';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { isBeanDecorator } from '../predicates/isBeanDecorator';
import { ICompilationBeanInfo } from './ICompilationBeanInfo';

export const getMethodBeanInfo = (methodDeclaration: ts.MethodDeclaration): ICompilationBeanInfo => {
    const bean = methodDeclaration.decorators?.find(isBeanDecorator) ?? null;

    if (bean === null) {
        CompilationContext.reportError({
            node: methodDeclaration,
            message: 'Bean should have @Bean decorator',
            filePath: methodDeclaration.getSourceFile().fileName,
            relatedContextPath: methodDeclaration.getSourceFile().fileName,
        });

        return {
            scope: 'singleton',
        };
    }

    const expression = bean.expression;

    if (ts.isIdentifier(expression)) {
        return {
            scope: 'singleton',
        };
    }

    if (ts.isCallExpression(expression)) {
        const firstArg = expression.arguments[0];

        if (!ts.isObjectLiteralExpression(firstArg)) {
            CompilationContext.reportError({
                message: 'Bean configuration should be an object literal',
                node: bean,
                filePath: methodDeclaration.getSourceFile().fileName,
                relatedContextPath: methodDeclaration.getSourceFile().fileName,
            });

            return {
                scope: 'singleton',
            };
        }

        return {
            scope: getScopeValue(firstArg),
        };
    }

    return {
        scope: 'singleton',
    };
};
