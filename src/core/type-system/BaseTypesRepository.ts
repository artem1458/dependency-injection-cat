import ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { DIType } from './DIType';
import { CONSTANTS } from '../../constants';
import { DITypeBuilder } from './DITypeBuilder';

class BaseTypes {
    declare array: DIType;
    declare set: DIType;
    declare map: DIType;
    declare mapStringToAny: DIType;
}

export class BaseTypesRepository {
    private static baseTypes: BaseTypes | null = null;

    static init(compilationContext: CompilationContext): void {
        if (this.baseTypes !== null) {
            return;
        }

        const librarySourceFile = compilationContext.program.getSourceFile(CONSTANTS.packageRoot);

        if (!librarySourceFile) {
            throw new Error('dependency-injection-cat library source file not found');
        }

        const typeTableDeclaration = librarySourceFile.statements
            .find((it): it is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(it) && it.name.getText() === '_TypeTable');

        if (!typeTableDeclaration) {
            throw new Error('dependency-injection-cat type table declaration not found');
        }

        const typesMap = typeTableDeclaration.members
            .reduce((acc, curr) => {
                acc[curr.name?.getText() ?? ''] = curr;

                return acc;
            }, {} as Record<string, ts.TypeElement>);

        this.baseTypes = new BaseTypes();

        this.baseTypes.array = DITypeBuilder.build(compilationContext.typeChecker.getTypeAtLocation(typesMap['array']), compilationContext);
        this.baseTypes.set = DITypeBuilder.build(compilationContext.typeChecker.getTypeAtLocation(typesMap['set']), compilationContext);
        this.baseTypes.map = DITypeBuilder.build(compilationContext.typeChecker.getTypeAtLocation(typesMap['map']), compilationContext);
        this.baseTypes.mapStringToAny = DITypeBuilder.build(compilationContext.typeChecker.getTypeAtLocation(typesMap['mapStringToAny']), compilationContext);
    }

    static getBaseTypes(): BaseTypes {
        if (this.baseTypes === null) {
            throw new Error('Base types are not initialized');
        }

        return this.baseTypes;
    }
}
