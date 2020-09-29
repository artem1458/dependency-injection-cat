import * as ts from 'typescript';
import { TypeQualifierError } from './TypeQualifierError';
import { END_PATH_TOKEN, END_UTILITY_TYPE, START_PATH_TOKEN, START_UTILITY_TYPE } from './parseTokens';
import { getNodeSourceDescriptorDeep } from '../../node-source-descriptor';
import { typescriptUtilityTypes } from './constants';

export function typeIdQualifierBase(node: ts.TypeReferenceNode): string {
    const sourceFile = node.getSourceFile();
    const nameToFind = node.typeName.getText();

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(sourceFile, nameToFind);

    if (nodeSourceDescriptor !== null) {
        return `${START_PATH_TOKEN}${nodeSourceDescriptor.path}${END_PATH_TOKEN}${nodeSourceDescriptor.name}`;
    }

    if (typescriptUtilityTypes.includes(nameToFind)) {
        return `${START_UTILITY_TYPE}${nameToFind}${END_UTILITY_TYPE}`;
    }

    throw new Error(TypeQualifierError.CanNotGenerateType);
}
