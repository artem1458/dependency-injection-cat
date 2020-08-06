import { Identifier, createIdentifier } from 'typescript';

export function getPrivateIdentifier(name: string): Identifier {
    return createIdentifier(`${name}$`);
}
