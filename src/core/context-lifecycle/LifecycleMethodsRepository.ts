import { IContextDescriptor } from '../context/ContextRepository';
import { IBeanDescriptor } from '../bean/BeanRepository';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import ts from 'typescript';
import { TLifecycle } from '../../external/InternalCatContext';
import { ExtendedSet } from '../utils/ExtendedSet';
import { QualifiedType } from '../ts-helpers/type-qualifier/QualifiedType';

export type TLifecycleNodeKind = 'method' | 'arrow-function';

export interface ILifecycleDependencyDescriptor {
    parameterName: string;
    qualifiedType: QualifiedType;
    beanDescriptors: ExtendedSet<IBeanDescriptor>;
}

export interface IContextLifecycleDescriptor {
    types: Set<TLifecycle>;
    node: ClassPropertyArrowFunction | ts.MethodDeclaration;
    nodeKind: TLifecycleNodeKind;
    classMemberName: string;
    contextDescriptor: IContextDescriptor;
    dependencies: ExtendedSet<ILifecycleDependencyDescriptor>;
}

export class LifecycleMethodsRepository {
    static contextDescriptorToLifecycleDescriptors = new Map<IContextDescriptor, Set<IContextLifecycleDescriptor>>();
    static nodeToContextLifecycleDescriptor = new WeakMap<ts.Node, IContextLifecycleDescriptor>();

    static register(contextDescriptor: IContextDescriptor, lifecycleDescriptor: IContextLifecycleDescriptor): void {
        let existSet = this.contextDescriptorToLifecycleDescriptors.get(contextDescriptor);

        if (!existSet) {
            existSet = new Set<IContextLifecycleDescriptor>();

            this.contextDescriptorToLifecycleDescriptors.set(contextDescriptor, existSet);
        }

        existSet.add(lifecycleDescriptor);
        this.nodeToContextLifecycleDescriptor.set(lifecycleDescriptor.node, lifecycleDescriptor);
    }

    static getLifecycleDescriptorsByContextDescriptorAndLifecycleType(
        contextDescriptor: IContextDescriptor,
        lifecycleType: TLifecycle
    ): Set<IContextLifecycleDescriptor> {
        const descriptors = this.contextDescriptorToLifecycleDescriptors.get(contextDescriptor) ?? new Set<IContextLifecycleDescriptor>();

        return new Set(Array.from(descriptors).filter(it => it.types.has(lifecycleType)));
    }

    static clearBeanInfoByContextDescriptor(contextDescriptor: IContextDescriptor): void {
        const contextLifecycleDescriptors = this.contextDescriptorToLifecycleDescriptors.get(contextDescriptor) ?? new Set<IContextLifecycleDescriptor>();

        this.contextDescriptorToLifecycleDescriptors.delete(contextDescriptor);
        contextLifecycleDescriptors.forEach(it => this.nodeToContextLifecycleDescriptor.delete(it.node));
    }

    static clear(): void {
        this.contextDescriptorToLifecycleDescriptors.clear();
    }
}
