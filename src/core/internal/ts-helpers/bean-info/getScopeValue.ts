import * as ts from 'typescript';
import { TBeanScope } from '../../decorators/Bean';
import { getClassMemberLocationMessage } from '../getClassMemberLocationMessage';
import { removeQuotesFromString } from '../../utils/removeQuotesFromString';

const scopes: Array<string | undefined> = ['singleton', 'prototype', undefined];

export function getScopeValue(expression: ts.ObjectLiteralExpression, method: ts.MethodDeclaration): TBeanScope | undefined {
    const scopeNode = expression.properties.find(it => it.name?.getText() === 'scope');
    if (scopeNode === undefined) {
        return undefined;
    }

    let scopeValue: string | undefined = undefined;

    if (ts.isPropertyAssignment(scopeNode)) {
        if (!ts.isStringLiteral(scopeNode.initializer)) {
            throw new Error('Scope in bean should be a string literal' + getClassMemberLocationMessage(method));
        }

        scopeValue = removeQuotesFromString(scopeNode.initializer.getText());
    }

    if (!scopes.includes(scopeValue)) {
        throw new Error('Scope in bean should be a "prototype" or "singleton"' + getClassMemberLocationMessage(method));
    }

    return scopeValue as TBeanScope | undefined;
}
