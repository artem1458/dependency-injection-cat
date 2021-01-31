import ts from 'typescript';
import { TBeanScopeValue } from '../ts-helpers/bean-info/ICompilationBeanInfo';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { v4 as uuid } from 'uuid';

type TBeanNode = ts.MethodDeclaration | ClassPropertyDeclarationWithInitializer

export interface IBeanDescriptor<T extends TBeanNode = TBeanNode> {
    classMemberName: string;
    qualifier: TBeanQualifier;
    contextName: TContextName;
    type: TBeanType;
    originalTypeName: string;
    scope: TBeanScopeValue;
    node: T;
}

export interface IBeanDescriptorWithId<T extends TBeanNode = TBeanNode> extends IBeanDescriptor<T> {
    id: string;
}

type TContextName = string;
type TBeanType = string;
type TBeanQualifier = string;

//Repository for return types of bean
export class BeanRepository {
    static beanDescriptorRepository = new Map<TContextName, Map<TBeanType, IBeanDescriptorWithId[]>>();
    static idToBeanDescriptorMap = new Map<string, IBeanDescriptorWithId>();

    static registerBean(descriptor: IBeanDescriptor): void {
        const descriptorWithId: IBeanDescriptorWithId = {
            ...descriptor,
            id: uuid(),
        };
        const { contextName, type } = descriptor;

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
    }

    static getBeanDescriptorsByType(contextName: TContextName, type: TBeanType): IBeanDescriptor[] {
        return this.beanDescriptorRepository.get(contextName)?.get(type) ?? [];
    }
}
