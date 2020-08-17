import { Identifier } from 'typescript';
import { getPrivateIdentifier } from './getPrivateIdentifier';

export function getPublicInstanceIdentifier(name: string): Identifier {
    return getPrivateIdentifier(`instance_${name}`);
}
