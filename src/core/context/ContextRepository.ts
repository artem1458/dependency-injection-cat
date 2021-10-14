import { NamedClassDeclaration } from '../ts-helpers/types';
import { INodeSourceDescriptor } from '../ts-helpers/node-source-descriptor';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';
import { GLOBAL_CONTEXT_NAME } from './constants';
import md5 from 'md5';

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

export interface TBeanTypeDescriptor {
    nodeSourceDescriptor: INodeSourceDescriptor;
    contextDescriptor: IContextDescriptor;
}

export class ContextRepository {
    static contextMap = new Map<TContextName, IContextDescriptor>();
    static globalContexts = new Map<TContextId, IContextDescriptor>();
    static contextNameToTBeanNodeSourceDescriptor = new Map<TContextName, TBeanTypeDescriptor>();
    static contextPathToContextDescriptor = new Map<string, IContextDescriptor>()

    static registerContext(
        name: string,
        classDeclaration: NamedClassDeclaration,
    ): IContextDescriptor {
        const sourceFile = classDeclaration.getSourceFile();
        const id = md5(sourceFile.fileName);

        const descriptor: IContextDescriptor = {
            id,
            name,
            isGlobal: false,
            className: removeQuotesFromString(classDeclaration.name.getText()),
            absolutePath: sourceFile.fileName,
            node: classDeclaration,
        };

        this.contextMap.set(name, descriptor);
        this.contextPathToContextDescriptor.set(sourceFile.fileName, descriptor);

        return descriptor;
    }

    static registerGlobalContext(
        classDeclaration: NamedClassDeclaration,
    ): IContextDescriptor {
        const sourceFile = classDeclaration.getSourceFile();
        const id = md5(sourceFile.fileName);

        const descriptor: IContextDescriptor = {
            id,
            name: GLOBAL_CONTEXT_NAME,
            isGlobal: true,
            absolutePath: sourceFile.fileName,
            node: classDeclaration,
            className: removeQuotesFromString(classDeclaration.name.getText()),
        };

        this.globalContexts.set(id, descriptor);
        this.contextPathToContextDescriptor.set(sourceFile.fileName, descriptor);

        return descriptor;
    }

    static getContextByName(name: TContextName): IContextDescriptor | null {
        return this.contextMap.get(name) ?? null;
    }

    static registerTBeanType(contextDescriptor: IContextDescriptor, nodeSourceDescriptor: INodeSourceDescriptor) {
        this.contextNameToTBeanNodeSourceDescriptor.set(
            contextDescriptor.name,
            {contextDescriptor, nodeSourceDescriptor}
        );
    }
}
