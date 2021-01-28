import * as ts from 'typescript';
import { IBeanInfo } from '../../decorators/Bean';
import { getClassMemberLocationMessage } from '../getClassMemberLocationMessage';
import { getQualifierValue } from './getQualifierValue';
import { getScopeValue } from './getScopeValue';

export function getPropertyBeanInfo(beanCall: ts.CallExpression): IBeanInfo {
    const method = beanCall.parent as ts.MethodDeclaration;

    if (beanCall.arguments.length === 0) {
        throw new Error('You should pass at least 1 argument to bean call' + getClassMemberLocationMessage(method));
    }

    const secondArg = beanCall.arguments[1];

    if (secondArg === undefined) {
        return {};
    }

    if (!ts.isObjectLiteralExpression(secondArg)) {
        throw new Error('Argument in bean should be object literal' + getClassMemberLocationMessage(method));
    }

    return {
        qualifier: getQualifierValue(secondArg, method),
        scope: getScopeValue(secondArg, method),
    };
}
