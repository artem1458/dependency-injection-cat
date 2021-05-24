import ts, { factory } from 'typescript';
import { IContextDescriptor } from '../../context/ContextRepository';
import { getGlobalContextVariableNameByContextId } from './getGlobalContextVariableNameByContextId';

export type TContextDescriptorToIdentifier = [IContextDescriptor, ts.Identifier];

export function getGlobalContextIdentifierFromArrayOrCreateNewAndPush(
    contextDescriptor: IContextDescriptor,
    globalContextDescriptorToIdentifiers: TContextDescriptorToIdentifier[],
): ts.Identifier {
    const oldIdentifier = globalContextDescriptorToIdentifiers.find(([descriptor]) => descriptor.id === contextDescriptor.id);

    if (oldIdentifier) {
        return oldIdentifier[1];
    }

    const newIdentifier = factory.createIdentifier(getGlobalContextVariableNameByContextId(contextDescriptor.id));

    globalContextDescriptorToIdentifiers.push([contextDescriptor, newIdentifier]);

    return newIdentifier;
}
