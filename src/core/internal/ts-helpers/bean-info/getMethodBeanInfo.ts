import * as ts from 'typescript';
import { getScopeValue } from './getScopeValue';
import { getQualifierValue } from './getQualifierValue';
import { IBeanInfo } from '../../../external/decorators/Bean';

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
        };
    }

    return {};
}
