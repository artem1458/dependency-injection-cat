import ts from 'typescript';
import { QualifiedType } from '../ts-helpers/type-qualifier/QualifiedType';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';

export const getParameterType = (parameter: ts.ParameterDeclaration): QualifiedType | null => {
    if (parameter.type === undefined) {
        return null;
    }

    return TypeQualifier.qualify(parameter.type);
};
