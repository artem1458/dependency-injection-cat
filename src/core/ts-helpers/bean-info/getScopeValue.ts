import * as ts from 'typescript';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { removeQuotesFromString } from '../../utils/removeQuotesFromString';
import { TBeanScopeValue } from './ICompilationBeanInfo';

const scopes: Array<TBeanScopeValue | null> = ['singleton', 'prototype'];

export const getScopeValue = (expression: ts.ObjectLiteralExpression): TBeanScopeValue => {
    const scopeNode = expression.properties.find(it => it.name?.getText() === 'scope');
    if (scopeNode === undefined) {
        return 'singleton';
    }

    let scopeValue: string | null = null;

    if (ts.isPropertyAssignment(scopeNode)) {
        if (!ts.isStringLiteral(scopeNode.initializer)) {
            CompilationContext.reportError({
                message: 'Bean scope should be a string literal',
                node: scopeNode,
                filePath: expression.getSourceFile().fileName,
            });
            return 'singleton';
        }

        scopeValue = removeQuotesFromString(scopeNode.initializer.getText());
    }

    if (!scopes.includes(scopeValue as TBeanScopeValue)) {
        CompilationContext.reportError({
            message: 'Scope in Bean should be a "prototype" or "singleton"',
            node: scopeNode,
            filePath: expression.getSourceFile().fileName,
        });
        return 'singleton';
    }

    return scopeValue as TBeanScopeValue;
};
