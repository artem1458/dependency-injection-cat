import * as ts from 'typescript';
import { IBeanInfo, TBeanScope } from '../../decorators/Bean';
import { removeQuotesFromString } from '../../utils/removeQuotesFromString';
import { getClassMemberLocationMessage } from '../getClassMemberLocationMessage';

const scopes: Array<string | undefined> = ['singleton', 'prototype', undefined];

export function getMethodBeanInfo(bean: ts.Decorator): IBeanInfo {
    const method = bean.parent as ts.MethodDeclaration;
    const expression = bean.expression;

    if (ts.isIdentifier(expression)) {
        return {};
    }


    if (ts.isCallExpression(expression)) {
        const firstArg = expression.arguments[0];

        if (!ts.isObjectLiteralExpression(firstArg)) {
            throw new Error('Argument in bean should be object literal' + getClassMemberLocationMessage(method));
        }

        return {
            qualifier: getQualifierValue(firstArg, method),
            scope: getScopeValue(firstArg, method),
        }
    }

    return {};
}

function getQualifierValue(expression: ts.ObjectLiteralExpression, method: ts.MethodDeclaration): string | undefined {
    const qualifierNode = expression.properties.find(it => it.name?.getText() === 'qualifier');
    if (qualifierNode === undefined) {
        return undefined;
    }

    let qualifierValue: string | undefined = undefined;

    if (ts.isPropertyAssignment(qualifierNode)) {
        if (!ts.isStringLiteral(qualifierNode.initializer)) {
            throw new Error('Qualifier in bean should be a string literal' + getClassMemberLocationMessage(method));
        }

        qualifierValue = removeQuotesFromString(qualifierNode.initializer.getText());
    }

    return qualifierValue;
}

function getScopeValue(expression: ts.ObjectLiteralExpression, method: ts.MethodDeclaration): TBeanScope | undefined {
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
