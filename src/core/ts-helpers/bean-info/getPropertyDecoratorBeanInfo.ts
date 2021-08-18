import * as ts from 'typescript';
import { getScopeValue } from './getScopeValue';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { isBeanDecorator } from '../predicates/isBeanDecorator';
import { ICompilationBeanInfo } from './ICompilationBeanInfo';
import { ClassPropertyArrowFunction } from '../types';

export const getPropertyDecoratorBeanInfo = (node: ts.MethodDeclaration | ClassPropertyArrowFunction | ts.PropertyDeclaration): ICompilationBeanInfo => {
    const bean = node.decorators?.find(isBeanDecorator) ?? null;

    if (bean === null) {
        CompilationContext.reportError({
            node: node,
            message: 'Bean should have @Bean decorator',
            filePath: node.getSourceFile().fileName,
            relatedContextPath: node.getSourceFile().fileName,
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
                filePath: node.getSourceFile().fileName,
                relatedContextPath: node.getSourceFile().fileName,
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
