import ts from 'typescript';
import { TBeanScopeValue } from '../ts-helpers/bean-info/ICompilationBeanInfo';
import {
    ClassPropertyArrowFunction,
    ClassPropertyDeclarationWithExpressionInitializer,
    ClassPropertyDeclarationWithInitializer
} from '../ts-helpers/types';
import { IContextDescriptor } from '../context/ContextRepository';
import { uniqId } from '../utils/uniqId';
import { QualifiedType } from '../ts-helpers/type-qualifier/QualifiedType';

export type TBeanNode = ts.MethodDeclaration
    | ClassPropertyDeclarationWithInitializer
    | ClassPropertyArrowFunction
    | ts.PropertyDeclaration
    | ClassPropertyDeclarationWithExpressionInitializer;
type TBeanKind = 'method' | 'property' | 'arrowFunction' | 'expression' | 'embedded';

export interface IBeanDescriptor<T extends TBeanNode = TBeanNode> {
    classMemberName: string;
    nestedProperty: string | null;
    contextDescriptor: IContextDescriptor;
    qualifiedType: QualifiedType;
    scope: TBeanScopeValue;
    node: T;
    beanKind: TBeanKind;
    beanSourceLocation: string | null;
    isPublic: boolean;
}

export interface IBeanDescriptorWithId<T extends TBeanNode = TBeanNode> extends IBeanDescriptor<T> {
    id: string;
}

type TContextName = string;
type TContextId = string;
type TBeanType = string;

export class BeanRepository {
    static beanDescriptorRepository = new Map<TContextName, Map<TBeanType, IBeanDescriptorWithId[]>>();
    static beanIdToBeanDescriptorMap = new Map<string, IBeanDescriptorWithId>();
    static contextIdToBeanDescriptorsMap = new Map<TContextId, IBeanDescriptorWithId[]>();
    static beanNodeToBeanDescriptorMap = new Map<TBeanNode, IBeanDescriptorWithId>();

    static registerBean(descriptor: IBeanDescriptor): void {
        const descriptorWithId: IBeanDescriptorWithId = {
            ...descriptor,
            id: uniqId(),
        };
        const { contextDescriptor: { name: contextName }, qualifiedType } = descriptor;

        const contextMap = this.beanDescriptorRepository.get(contextName) ?? new Map();

        if (!this.beanDescriptorRepository.has(contextName)) {
            this.beanDescriptorRepository.set(contextName, contextMap);
        }

        qualifiedType.typeIds.forEach(typeId => {
            let beanDescriptorList = contextMap.get(typeId) ?? null;

            if (beanDescriptorList === null) {
                beanDescriptorList = [];
                contextMap.set(typeId, beanDescriptorList);
            }

            beanDescriptorList.push(descriptorWithId);
        });

        this.beanIdToBeanDescriptorMap.set(descriptorWithId.id, descriptorWithId);
        this.beanNodeToBeanDescriptorMap.set(descriptorWithId.node, descriptorWithId);

        const contextDescriptors = this.contextIdToBeanDescriptorsMap.get(descriptor.contextDescriptor.id) ?? [];

        if (!this.contextIdToBeanDescriptorsMap.has(descriptor.contextDescriptor.id)) {
            this.contextIdToBeanDescriptorsMap.set(descriptor.contextDescriptor.id, contextDescriptors);
        }

        contextDescriptors.push(descriptorWithId);
    }

    static clearBeanInfoByContextDescriptor(contextDescriptor: IContextDescriptor): void {
        const beanDescriptorsInContext = Array.from(this.beanIdToBeanDescriptorMap.values()).filter(it =>
            it.contextDescriptor.absolutePath === contextDescriptor.absolutePath,
        );

        const contextBeansMap = this.beanDescriptorRepository.get(contextDescriptor.name) ?? new Map<TBeanType, IBeanDescriptorWithId[]>();

        for (const [beanType, beanDescriptors] of contextBeansMap) {
            const filteredBeanDescriptors = beanDescriptors
                .filter(it => it.contextDescriptor.absolutePath !== contextDescriptor.absolutePath);

            contextBeansMap.set(beanType, filteredBeanDescriptors);
        }

        this.contextIdToBeanDescriptorsMap.delete(contextDescriptor.id);
        beanDescriptorsInContext.forEach((beanDescriptor) => {
            this.beanIdToBeanDescriptorMap.delete(beanDescriptor.id);
            this.beanNodeToBeanDescriptorMap.delete(beanDescriptor.node);
        });
    }
}
