import * as ts from 'typescript';
import { ITypeIdQualifierResult } from '../common/types';
import { typeIdQualifier } from '../common/typeIdQualifier';
import { END_QUALIFIER_TOKEN, START_QUALIFIER_TOKEN } from '../common/parseTokens';
import { removeQuotesFromString } from '../../../utils/removeQuotesFromString';
import { CallExpressionWithTypeArguments } from '../../call-expression/CallExpressionWithTypeArguments';

export function getCallTypeIdQualifier(callExpression: CallExpressionWithTypeArguments): ITypeIdQualifierResult {
    const baseType = typeIdQualifier(callExpression.typeArguments[0]);

    if (callExpression.arguments.length === 0) {
        return baseType;
    }

    const firstArgument = callExpression.arguments[0];

    if (!ts.isStringLiteral(firstArgument)) {
        throw new Error(`Bean name in container.get should be a string literal, ${callExpression.getText()}, ${callExpression.getSourceFile().fileName}`);
    }

    const qualifier = removeQuotesFromString(firstArgument.getText());

    if (qualifier === '') {
        throw new Error(`Bean name should not be empty string, ${callExpression.getText()}, ${callExpression.getSourceFile().fileName}`);
    }

    return {
        typeId: `${baseType.typeId}${START_QUALIFIER_TOKEN}${qualifier}${END_QUALIFIER_TOKEN}`,
        originalTypeName: baseType.originalTypeName,
    };
}
