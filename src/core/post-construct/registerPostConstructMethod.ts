import ts from 'typescript';
import { IContextDescriptor } from '../context/ContextRepository';
import { getQualifierValueFromFunctionArgument } from '../bean-dependencies/getQualifierValueFromFunctionArgument';
import { getParameterType } from '../bean-dependencies/getParameterType';

export const registerPostConstructMethod = (contextDescriptor: IContextDescriptor, node: ts.MethodDeclaration): void => {
    node.parameters.forEach(parameter => {
        const qualifier = getQualifierValueFromFunctionArgument(parameter, contextDescriptor);
        const type = getParameterType(parameter);

    });
};
