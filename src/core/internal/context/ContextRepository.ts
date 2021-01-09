import ts from 'typescript';
import { NamedClassDeclaration } from '../ts-helpers/types';
import { uniqId } from '../../../utils/uniqId';

type TContextName = string;

export interface IContextDescriptor {
    id: string;
    name: TContextName;
    absolutePath: string;
    node: NamedClassDeclaration;
}

export class ContextRepository {
    static repository = new Map<ts.ClassDeclaration, IContextDescriptor>();

    static registerContext(
        name: string,
        classDeclaration: NamedClassDeclaration,
    ): IContextDescriptor {
        const id = uniqId();
        const sourceFile = classDeclaration.getSourceFile();

        const descriptor: IContextDescriptor = {
            id,
            name,
            absolutePath: sourceFile.fileName,
            node: classDeclaration,
        };

        this.repository.set(classDeclaration, descriptor);

        return descriptor;
    }

    static getContext(classDeclaration: ts.ClassDeclaration): IContextDescriptor | null {
        return this.repository.get(classDeclaration) ?? null;
    }

    static hasContext(classDeclaration: ts.ClassDeclaration): boolean {
        return this.repository.has(classDeclaration);
    }
}
