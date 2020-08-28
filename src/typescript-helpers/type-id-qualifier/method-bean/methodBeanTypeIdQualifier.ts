import * as ts from 'typescript';
import { ITypeIdQualifierResult } from '../common/types';
import { getMethodLocationMessage } from '../../getMethodLocationMessage';
import { typeIdQualifier } from '../common/typeIdQualifier';
import { isMethodBean } from '../../decorator-helpers/isMethodBean';

export function methodBeanTypeIdQualifier(method: ts.MethodDeclaration): ITypeIdQualifierResult {
    if (method.type === undefined) {
        throw new Error('Bean should should have a type' + getMethodLocationMessage(method));
    }

    const baseType = typeIdQualifier(method.type);

    let beansDecoratorsCount = 0;

    method.decorators?.forEach(it => {
        if (isMethodBean())
    })
}
