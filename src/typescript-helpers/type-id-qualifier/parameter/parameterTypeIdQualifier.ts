import * as ts from 'typescript';
import { getClassMemberLocationMessage } from '../../getClassMemberLocationMessage';
import { typeIdQualifier } from '../common/typeIdQualifier';
import { isParameterQualifierDecorator } from '../../decorator-helpers/isParameterQualifierDecorator';
import { removeQuotesFromString } from '../../../utils/removeQuotesFromString';
import { END_QUALIFIER_TOKEN, START_QUALIFIER_TOKEN } from '../common/parseTokens';
import { ITypeIdQualifierResult } from '../common/types';

export function parameterTypeIdQualifier(parameter: ts.ParameterDeclaration): ITypeIdQualifierResult {
    if (parameter.type === undefined) {
        throw new Error('All parameters in Bean should have type' + getClassMemberLocationMessage(parameter.parent as ts.MethodDeclaration));
    }

    const baseType = typeIdQualifier(parameter.type);

    let qualifierExpressionsCount = 0;
    let qualifierCallExpression: ts.CallExpression | undefined;

    parameter.decorators?.forEach(it => {
        if (isParameterQualifierDecorator(it) && ts.isCallExpression(it.expression)) {
            qualifierExpressionsCount++;
            qualifierCallExpression = it.expression;
        }
    });

    if (qualifierCallExpression === undefined) {
        return baseType;
    }

    const parent = parameter.parent as ts.MethodDeclaration;

    if (qualifierExpressionsCount > 1) {
        throw new Error('Parameter can not have more that 1 @Qualifier' + getClassMemberLocationMessage(parent));
    }

    if (qualifierCallExpression.arguments.length === 0) {
        throw new Error('You should pass argument to @Qualifier' + getClassMemberLocationMessage(parent));
    }

    if (!ts.isStringLiteral(qualifierCallExpression.arguments[0])) {
        throw new Error('Argument in @Qualifier should be a string literal' + getClassMemberLocationMessage(parent));
    }

    const qualifier = removeQuotesFromString(qualifierCallExpression.arguments[0].getText());

    if (qualifier === '') {
        throw new Error('Argument in @Qualifier should not be empty string' + getClassMemberLocationMessage(parent));
    }

    return {
        typeId: `${baseType.typeId}${START_QUALIFIER_TOKEN}${qualifier}${END_QUALIFIER_TOKEN}`,
        originalTypeName: baseType.originalTypeName,
    };
}
