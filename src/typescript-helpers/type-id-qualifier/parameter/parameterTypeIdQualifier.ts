import * as ts from 'typescript';
import { getMethodLocationMessage } from '../../getMethodLocationMessage';
import { typeIdQualifier } from '../common/typeIdQualifier';
import { isParameterQualifierDecorator } from '../../decorator-helpers/isParameterQualifierDecorator';

export function parameterTypeIdQualifier(parameter: ts.ParameterDeclaration): string {
    if (parameter.type === undefined) {
        throw new Error('All parameters in Bean should have type' + getMethodLocationMessage(parameter.parent as ts.MethodDeclaration));
    }

    const baseType = typeIdQualifier(parameter.type);

    let qualifierCallExpression: ts.CallExpression | undefined = undefined;

    parameter.decorators?.forEach(it => {
        if (isParameterQualifierDecorator(it) && ts.isCallExpression(it.expression)) {
            qualifierCallExpression = it.expression;
        }
    });

    if (qualifierCallExpression === undefined) {
        return baseType.typeId;
    }

    if (qualifierCallExpression.arguments)????

    return ''
}
