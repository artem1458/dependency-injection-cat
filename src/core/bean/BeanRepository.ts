import ts from 'typescript';
import { TBeanScopeValue } from '../ts-helpers/bean-info/ICompilationBeanInfo';
import { ClassPropertyArrowFunction, ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { IContextDescriptor } from '../context/ContextRepository';
import { uniqId } from '../utils/uniqId';
import { QualifiedType, QualifiedTypeKind } from '../ts-helpers/type-qualifier-v2/QualifiedType';
import { CompilationContext } from '../../compilation-context/CompilationContext';

export type TBeanNode = ts.MethodDeclaration | ClassPropertyDeclarationWithInitializer | ClassPropertyArrowFunction | ts.PropertyDeclaration;
type TBeanKind = 'method' | 'property' | 'arrowFunction' | 'expression';

export interface IBeanDescriptor<T extends TBeanNode = TBeanNode> {
    classMemberName: string;
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
        if (descriptor.qualifiedType.kind === QualifiedTypeKind.LIST) {
            CompilationContext.reportError({
                node: descriptor.qualifiedType.typeNode,
                message: 'Bean type can not be a list',
                relatedContextPath: descriptor.contextDescriptor.absolutePath,
                filePath: descriptor.contextDescriptor.absolutePath,
            });

            return;
        }

        const descriptorWithId: IBeanDescriptorWithId = {
            ...descriptor,
            id: uniqId(),
        };
        const { contextDescriptor: { name: contextName }, qualifiedType } = descriptor;

        let contextMap = this.beanDescriptorRepository.get(contextName) ?? null;

        if (contextMap === null) {
            contextMap = new Map();
            this.beanDescriptorRepository.set(contextName, contextMap);
        }

        qualifiedType.typeIds.forEach(typeId => {
            let beanDescriptorList = contextMap!.get(typeId) ?? null;

            if (beanDescriptorList === null) {
                beanDescriptorList = [];
                contextMap!.set(typeId, beanDescriptorList);
            }

            beanDescriptorList.push(descriptorWithId);
        });

        this.beanIdToBeanDescriptorMap.set(descriptorWithId.id, descriptorWithId);
        this.beanNodeToBeanDescriptorMap.set(descriptorWithId.node, descriptorWithId);

        let contextDescriptors = this.contextIdToBeanDescriptorsMap.get(descriptor.contextDescriptor.id) ?? null;

        if (contextDescriptors === null) {
            contextDescriptors = [];
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
