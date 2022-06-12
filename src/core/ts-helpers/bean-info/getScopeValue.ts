import * as ts from 'typescript';
import { unquoteString } from '../../utils/unquoteString';
import { TBeanScopeValue } from './ICompilationBeanInfo';
import { CompilationContext } from '../../../build-context/CompilationContext';
import { IContextDescriptor } from '../../context/ContextRepository';
import { IncorrectArgumentError } from '../../../exceptions/compilation/errors/IncorrectArgumentError';

const scopes: Array<TBeanScopeValue | null> = ['singleton', 'prototype'];

export const getScopeValue = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    expression: ts.ObjectLiteralExpression
): TBeanScopeValue => {
    const scopeNode = expression.properties.find(it => it.name?.getText() === 'scope');

    if (scopeNode === undefined) {
        return 'singleton';
    }

    let scopeValue: string | null = null;

    if (ts.isPropertyAssignment(scopeNode)) {
        if (!ts.isStringLiteral(scopeNode.initializer)) {
            compilationContext.report(new IncorrectArgumentError(
                'Bean scope value should be a string literal',
                scopeNode,
                contextDescriptor.node,
            ));
            return 'singleton';
        }

        scopeValue = unquoteString(scopeNode.initializer.getText());
    }

    if (!scopes.includes(scopeValue as TBeanScopeValue)) {
        compilationContext.report(new IncorrectArgumentError(
            'Bean scope value should be a a "prototype" or "singleton"',
            scopeNode,
            contextDescriptor.node,
        ));
        return 'singleton';
    }

    return scopeValue as TBeanScopeValue;
};
