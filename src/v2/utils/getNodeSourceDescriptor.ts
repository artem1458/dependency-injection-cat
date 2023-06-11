import ts from 'typescript';
import { CONSTANTS } from '../../constants';
import { isNamedDeclaration } from './isNamedDeclaration';
import upath from 'upath';

interface INodeSource {
    fileName: string;
    originalName: string | null;
    isLibraryNode: boolean;
    originalNode: ts.Node | null;
}

export const getNodeSourceDescriptor = (node: ts.Node, program: ts.Program): INodeSource | null => {
    const typeChecker = program.getTypeChecker();
    const symbol = typeChecker.getSymbolAtLocation(node);

    if (symbol === undefined) {
        return null;
    }

    const originalSymbol = typeChecker.getAliasedSymbol(symbol);
    const declarations = originalSymbol.getDeclarations() ?? [];

    if (declarations.length === 0) {
        return null;
    }

    if (declarations.length > 1) {
        //TODO
        throw new Error('Multiple declarations found');
    }

    const declaration = declarations[0];

    if (!isNamedDeclaration(declaration)) {
        return {
            fileName: declaration.getSourceFile().fileName,
            isLibraryNode: false,
            originalNode: declaration,
            originalName: null,
        };
    }

    return {
        fileName: declaration.getSourceFile().fileName,
        isLibraryNode: upath.resolve(declaration.getSourceFile().fileName, '../') === CONSTANTS.packageRootDir,
        originalNode: declaration,
        originalName: declaration.name?.getText() ?? null,
    };
};
