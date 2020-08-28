import * as ts from 'typescript';
import { getMethodLocationMessage } from '../../getMethodLocationMessage';
import { typeIdQualifier } from '../common/typeIdQualifier';
import { isParameterQualifierDecorator } from '../../decorator-helpers/isParameterQualifierDecorator';
import { removeQuotesFromString } from '../../../utils/removeQuotesFromString';
import { END_QUALIFIER_TOKEN, START_QUALIFIER_TOKEN } from '../common/parseTokens';

export function parameterTypeIdQualifier(parameter: ts.ParameterDeclaration): string {
    if (parameter.type === undefined) {
        throw new Error('All parameters in Bean should have type' + getMethodLocationMessage(parameter.parent as ts.MethodDeclaration));
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
        return baseType.typeId;
    }

    const parent = parameter.parent as ts.MethodDeclaration;

    if (qualifierExpressionsCount > 1) {
        throw new Error('Parameter can not have more that 1 @Qualifier' + getMethodLocationMessage(parent));
    }

    if (qualifierCallExpression.arguments.length === 0) {
        throw new Error('You should pass argument to @Qualifier' + getMethodLocationMessage(parent));
    }

    if (!ts.isStringLiteral(qualifierCallExpression.arguments[0])) {
        throw new Error('Argument in @Qualifier should be a string literal' + getMethodLocationMessage(parent));
    }

    const qualifier = removeQuotesFromString(qualifierCallExpression.arguments[0].getText());

    if (qualifier === '') {
        throw new Error('Argument in @Qualifier should not be empty string' + getMethodLocationMessage(parent));
    }

    return `${baseType.typeId}${START_QUALIFIER_TOKEN}${qualifier}${END_QUALIFIER_TOKEN}`;
}
