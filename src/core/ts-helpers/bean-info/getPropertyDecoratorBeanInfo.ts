import * as ts from 'typescript';
import { getScopeValue } from './getScopeValue';
import { isBeanDecorator } from '../predicates/isBeanDecorator';
import { ICompilationBeanInfo } from './ICompilationBeanInfo';
import { ClassPropertyArrowFunction } from '../types';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { IContextDescriptor } from '../../context/ContextRepository';
import { UnknownError } from '../../../compilation-context/messages/errors/UnknownError';
import { IncorrectArgumentError } from '../../../compilation-context/messages/errors/IncorrectArgumentError';
import { getDecoratorsOnly } from '../../utils/getDecoratorsOnly';

export const getPropertyDecoratorBeanInfo = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    node: ts.MethodDeclaration | ClassPropertyArrowFunction | ts.PropertyDeclaration
): ICompilationBeanInfo => {
    const bean = getDecoratorsOnly(node).find(isBeanDecorator) ?? null;

    if (bean === null) {
        compilationContext.report(new UnknownError(
            'Bean do not have @Bean decorator',
            node,
            contextDescriptor.node,
        ));

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
            compilationContext.report(new IncorrectArgumentError(
                'Configuration object should be an object literal.',
                firstArg,
                contextDescriptor.node,
            ));

            return {
                scope: 'singleton',
            };
        }

        return {
            scope: getScopeValue(compilationContext, contextDescriptor, firstArg),
        };
    }

    return {
        scope: 'singleton',
    };
};
