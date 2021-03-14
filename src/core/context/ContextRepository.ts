import { NamedClassDeclaration } from '../ts-helpers/types';
import { uniqId } from '../utils/uniqId';
import { INodeSourceDescriptor } from '../ts-helpers/node-source-descriptor';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';
import { GLOBAL_CONTEXT_NAME } from './constants';

type TContextName = string;
type TContextId = string;

export interface IContextDescriptor {
    id: string;
    name: TContextName;
    isGlobal: boolean;
    className: string;
    absolutePath: string;
    node: NamedClassDeclaration;
}

export class ContextRepository {
    static contextMap = new Map<TContextName, IContextDescriptor>();
    static globalContexts = new Map<TContextId, IContextDescriptor>();
    static contextNameToTBeanNodeSourceDescriptor = new Map<TContextName, INodeSourceDescriptor>();

    static registerContext(
        name: string,
        classDeclaration: NamedClassDeclaration,
    ): IContextDescriptor {
        const id = uniqId();
        const sourceFile = classDeclaration.getSourceFile();

        const descriptor: IContextDescriptor = {
            id,
            name,
            isGlobal: false,
            className: removeQuotesFromString(classDeclaration.name.getText()),
            absolutePath: sourceFile.fileName,
            node: classDeclaration,
        };

        this.contextMap.set(name, descriptor);

        return descriptor;
    }

    static registerGlobalContext(
        classDeclaration: NamedClassDeclaration,
    ): IContextDescriptor {
        const id = uniqId();
        const sourceFile = classDeclaration.getSourceFile();

        const descriptor: IContextDescriptor = {
            id,
            name: GLOBAL_CONTEXT_NAME,
            isGlobal: true,
            absolutePath: sourceFile.fileName,
            node: classDeclaration,
            className: removeQuotesFromString(classDeclaration.name.getText()),
        };

        this.globalContexts.set(id, descriptor);

        return descriptor;
    }

    static getContextByName(name: TContextName): IContextDescriptor | null {
        return this.contextMap.get(name) ?? null;
    }

    static hasContext(name: TContextName): boolean {
        return this.contextMap.has(name);
    }

    static registerBeanType(contextName: TContextName, beanType: INodeSourceDescriptor) {
        this.contextNameToTBeanNodeSourceDescriptor.set(contextName, beanType);
    }
}
