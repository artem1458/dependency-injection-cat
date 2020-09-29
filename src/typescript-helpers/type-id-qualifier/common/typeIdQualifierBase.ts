import * as ts from 'typescript';
import { TypeQualifierError } from './TypeQualifierError';
import { END_PATH_TOKEN, START_PATH_TOKEN } from './parseTokens';
import { getNodeSourceDescriptorDeep } from '../../node-source-descriptor';

export function typeIdQualifierBase(node: ts.TypeReferenceNode): string {
    const sourceFile = node.getSourceFile();
    const nameToFind = node.getText();

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(sourceFile, nameToFind);

    if (nodeSourceDescriptor === null) {
        throw new Error(TypeQualifierError.CanNotGenerateType);
    }

    return `${START_PATH_TOKEN}${nodeSourceDescriptor.path}${END_PATH_TOKEN}${nodeSourceDescriptor.name}`;
}
