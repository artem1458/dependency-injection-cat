import { NamedClassDeclaration } from '../ts-helpers/types';
import { uniqId } from '../utils/uniqId';

type TContextName = string;

export interface IContextDescriptor {
    id: string;
    name: TContextName;
    absolutePath: string;
    node: NamedClassDeclaration;
}

export class ContextRepository {
    static repository = new Map<TContextName, IContextDescriptor>();

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

        this.repository.set(name, descriptor);

        return descriptor;
    }

    static getContextByName(name: TContextName): IContextDescriptor | null {
        return this.repository.get(name) ?? null;
    }

    static hasContext(name: TContextName): boolean {
        return this.repository.has(name);
    }
}
