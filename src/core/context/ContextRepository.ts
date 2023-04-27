import { NamedClassDeclaration } from '../ts-helpers/types';
import { INodeSourceDescriptor } from '../ts-helpers/node-source-descriptor';
import { unquoteString } from '../utils/unquoteString';
import md5 from 'md5';
import ts from 'typescript';

type TContextName = string;
type TContextId = string;

export interface IContextDescriptor {
    id: string;
    name: TContextName;
    className: string;
    absolutePath: string;
    node: NamedClassDeclaration;
}

export interface IContextInterfaceDescriptor {
    absolutePath: string;
    node: ts.InterfaceDeclaration;
    contextDescriptor: IContextDescriptor;
}

export class ContextRepository {
    static contextMap = new Map<TContextName, IContextDescriptor>();
    static contextDescriptorToContextInterface = new Map<IContextDescriptor, IContextInterfaceDescriptor>();
    static contextPathToContextDescriptor = new Map<string, IContextDescriptor>();

    static registerContext(
        name: string,
        classDeclaration: NamedClassDeclaration,
    ): IContextDescriptor {
        const sourceFile = classDeclaration.getSourceFile();
        const id = md5(sourceFile.fileName);

        const descriptor: IContextDescriptor = {
            id,
            name,
            className: unquoteString(classDeclaration.name.getText()),
            absolutePath: sourceFile.fileName,
            node: classDeclaration,
        };

        this.contextMap.set(name, descriptor);
        this.contextPathToContextDescriptor.set(sourceFile.fileName, descriptor);

        return descriptor;
    }

    static getContextByName(name: TContextName): IContextDescriptor | null {
        return this.contextMap.get(name) ?? null;
    }

    static registerContextInterface(contextDescriptor: IContextDescriptor, node: ts.InterfaceDeclaration, nodeSourceDescriptor: INodeSourceDescriptor) {
        this.contextDescriptorToContextInterface.set(
            contextDescriptor,
            {node: node, absolutePath: nodeSourceDescriptor.path, contextDescriptor: contextDescriptor}
        );
    }

    static clear(): void {
        this.contextMap.clear();
        this.contextDescriptorToContextInterface.clear();
        this.contextPathToContextDescriptor.clear();
    }
}
