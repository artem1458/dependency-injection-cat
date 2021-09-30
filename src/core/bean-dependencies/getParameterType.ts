import ts from 'typescript';
import { QualifiedType } from '../ts-helpers/type-qualifier-v2/QualifiedType';
import { TypeQualifier } from '../ts-helpers/type-qualifier-v2/TypeQualifier';

export const getParameterType = (parameter: ts.ParameterDeclaration): QualifiedType | null => {
    if (parameter.type === undefined) {
        return null;
    }

    return TypeQualifier.qualify(parameter.type);
};
