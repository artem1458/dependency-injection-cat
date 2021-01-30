import ts from 'typescript';
import { TBeanScopeValue } from '../ts-helpers/bean-info/ICompilationBeanInfo';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';

export interface IBeanDescriptor<T extends ts.MethodDeclaration | ClassPropertyDeclarationWithInitializer = ts.MethodDeclaration | ClassPropertyDeclarationWithInitializer> {
    classMemberName: string;
    qualifier: TBeanQualifier;
    contextName: TContextName;
    type: TBeanType;
    originalTypeName: string;
    scope: TBeanScopeValue;
    node: T;
}

type TContextName = string;
type TBeanType = string;
type TBeanQualifier = string | null;

//Repository for return types of bean
export class BeansRepository {
    static beansDescriptorRepository = new Map<TContextName, Map<TBeanType, IBeanDescriptor[]>>();

    static registerBean(descriptor: IBeanDescriptor): void {
        const { contextName, type } = descriptor;

        let contextMap = this.beansDescriptorRepository.get(contextName) ?? null;

        if (contextMap === null) {
            contextMap = new Map();
            this.beansDescriptorRepository.set(contextName, contextMap);
        }

        let beanDescriptorList = contextMap.get(type) ?? null;

        if (beanDescriptorList === null) {
            beanDescriptorList = [];
            contextMap.set(type, beanDescriptorList);
        }

        beanDescriptorList.push(descriptor);
    }

    static getBeanDescriptorsByType(contextName: TContextName, type: TBeanType): IBeanDescriptor[] {
        return this.beansDescriptorRepository.get(contextName)?.get(type) ?? [];
    }
}
