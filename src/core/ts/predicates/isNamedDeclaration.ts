import ts from 'typescript';

export const isNamedDeclaration = (declaration: ts.Declaration): declaration is ts.NamedDeclaration => {
    // eslint-disable-next-line no-prototype-builtins
    return (Object.hasOwn && Object.hasOwn(declaration, 'name')) || Object.prototype.hasOwnProperty.call(declaration, 'name');
};
