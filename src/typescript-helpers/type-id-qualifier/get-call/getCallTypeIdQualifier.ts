import * as ts from 'typescript';
import { ITypeIdQualifierResult } from '../common/types';
import { typeIdQualifier } from '../common/typeIdQualifier';
import { END_QUALIFIER_TOKEN, START_QUALIFIER_TOKEN } from '../common/parseTokens';
import { removeQuotesFromString } from '../../../utils/removeQuotesFromString';

export function getCallTypeIdQualifier(callExpression: ts.CallExpression): ITypeIdQualifierResult {
    if (callExpression.typeArguments === undefined) {
        throw new Error(`It seems you forgot to pass generic type to container.get call, ${callExpression.getText()}, ${callExpression.getSourceFile().fileName}`);
    }

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
        throw new Error(`Bean name in container.get should not be empty string, ${callExpression.getText()}, ${callExpression.getSourceFile().fileName}`);
    }

    return {
        typeId: `${baseType.typeId}${START_QUALIFIER_TOKEN}${qualifier}${END_QUALIFIER_TOKEN}`,
        originalTypeName: baseType.originalTypeName,
    }
}
