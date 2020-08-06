import { Identifier } from 'typescript';
import { getPrivateIdentifier } from './getPrivateIdentifier';

export function getPrivateInstanceIdentifier(name: string): Identifier {
    return getPrivateIdentifier(`_instance_${name}`);
}
