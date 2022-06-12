import ts from 'typescript';
import { QualifiedType } from '../ts-helpers/type-qualifier/QualifiedType';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { IContextDescriptor } from '../context/ContextRepository';

export const getParameterType = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    parameter: ts.ParameterDeclaration
): QualifiedType | null => {
    if (parameter.type === undefined) {
        return null;
    }

    return TypeQualifier.qualify(compilationContext, contextDescriptor, parameter.type);
};
