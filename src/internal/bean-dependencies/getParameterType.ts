import ts from 'typescript';
import { IQualifiedType } from '../ts-helpers/type-qualifier/types';
import { typeQualifier } from '../ts-helpers/type-qualifier/typeQualifier';

export const getParameterType = (parameter: ts.ParameterDeclaration): IQualifiedType | null => {
    if (parameter.type === undefined) {
        return null;
    }

    return typeQualifier(parameter.type);
};
