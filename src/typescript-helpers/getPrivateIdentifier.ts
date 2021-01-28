import { createIdentifier, Identifier } from 'typescript';

export function getPrivateIdentifier(name: string): Identifier {
    return createIdentifier(`${name}$`);
}
