import { NamedClassDeclaration } from '../ts-helpers/types';
import { INodeSourceDescriptor } from '../ts-helpers/node-source-descriptor';
import { unquoteString } from '../utils/unquoteString';
import md5 from 'md5';
import ts from 'typescript';

type TContextName = string;

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
    static contextIdToContextDescriptor = new Map<string, IContextDescriptor>();
    static contextDescriptorToContextInterface = new Map<IContextDescriptor, IContextInterfaceDescriptor>();
    static contextPathToContextDescriptor = new Map<string, IContextDescriptor>();

    static registerContext(
        name: string,
        classDeclaration: NamedClassDeclaration,
    ): IContextDescriptor {
        const sourceFile = classDeclaration.getSourceFile();

        const descriptor: IContextDescriptor = {
            id: this.buildContextId(classDeclaration),
            name,
            className: unquoteString(classDeclaration.name.getText()),
            absolutePath: sourceFile.fileName,
            node: classDeclaration,
        };

        this.contextIdToContextDescriptor.set(descriptor.id, descriptor);
        this.contextPathToContextDescriptor.set(sourceFile.fileName, descriptor);

        return descriptor;
    }

    static buildContextId(classDeclaration: NamedClassDeclaration): string {
        const sourceFile = classDeclaration.getSourceFile();
        const name = classDeclaration.name.getText();

        return md5(`${sourceFile.fileName}_${name}`);
    }

    static registerContextInterface(contextDescriptor: IContextDescriptor, node: ts.InterfaceDeclaration, nodeSourceDescriptor: INodeSourceDescriptor) {
        this.contextDescriptorToContextInterface.set(
            contextDescriptor,
            {node: node, absolutePath: nodeSourceDescriptor.path, contextDescriptor: contextDescriptor}
        );
    }

    static clear(): void {
        this.contextIdToContextDescriptor.clear();
        this.contextDescriptorToContextInterface.clear();
        this.contextPathToContextDescriptor.clear();
    }

    static clearByContextId(id: string): void {
        const descriptor = this.contextIdToContextDescriptor.get(id);

        if (!descriptor) {
            return;
        }

        this.contextIdToContextDescriptor.delete(id);
        this.contextDescriptorToContextInterface.delete(descriptor);
    }
}
