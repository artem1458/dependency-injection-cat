import ts from 'typescript';
import { TBeanScopeValue } from '../ts-helpers/bean-info/ICompilationBeanInfo';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { v4 as uuid } from 'uuid';
import { IContextDescriptor } from '../context/ContextRepository';

export type TBeanNode = ts.MethodDeclaration | ClassPropertyDeclarationWithInitializer

export interface IBeanDescriptor<T extends TBeanNode = TBeanNode> {
    classMemberName: string;
    contextDescriptor: IContextDescriptor;
    type: TBeanType;
    originalTypeName: string;
    scope: TBeanScopeValue;
    node: T;
    typeNode: ts.TypeNode;
}

export interface IBeanDescriptorWithId<T extends TBeanNode = TBeanNode> extends IBeanDescriptor<T> {
    id: string;
}

type TContextName = string;
type TContextId = string;
type TBeanType = string;

export class BeanRepository {
    static beanDescriptorRepository = new Map<TContextName, Map<TBeanType, IBeanDescriptorWithId[]>>();
    static idToBeanDescriptorMap = new Map<string, IBeanDescriptorWithId>();
    static contextIdToBeanDescriptorsMap = new Map<TContextId, IBeanDescriptorWithId[]>();
    static beanNodeToBeanDescriptorMap = new Map<TBeanNode, IBeanDescriptorWithId>()

    static registerBean(descriptor: IBeanDescriptor): void {
        const descriptorWithId: IBeanDescriptorWithId = {
            ...descriptor,
            id: uuid(),
        };
        const { contextDescriptor: { name: contextName }, type } = descriptor;

        let contextMap = this.beanDescriptorRepository.get(contextName) ?? null;

        if (contextMap === null) {
            contextMap = new Map();
            this.beanDescriptorRepository.set(contextName, contextMap);
        }

        let beanDescriptorList = contextMap.get(type) ?? null;

        if (beanDescriptorList === null) {
            beanDescriptorList = [];
            contextMap.set(type, beanDescriptorList);
        }

        beanDescriptorList.push(descriptorWithId);
        this.idToBeanDescriptorMap.set(descriptorWithId.id, descriptorWithId);
        this.beanNodeToBeanDescriptorMap.set(descriptorWithId.node, descriptorWithId);

        let contextDescriptors = this.contextIdToBeanDescriptorsMap.get(descriptor.contextDescriptor.id) ?? null;

        if (contextDescriptors === null) {
            contextDescriptors = [];
            this.contextIdToBeanDescriptorsMap.set(descriptor.contextDescriptor.id, contextDescriptors);
        }
        contextDescriptors.push(descriptorWithId);
    }
}
