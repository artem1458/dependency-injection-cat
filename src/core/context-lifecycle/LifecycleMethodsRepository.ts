import { IContextDescriptor } from '../context/ContextRepository';
import { IBeanDescriptor } from '../bean/BeanRepository';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import ts from 'typescript';

export type TLifecycle = 'post-construct' | 'before-destruct'

interface IContextLifecycleDescriptor {
    types: Set<TLifecycle>;
    node: ClassPropertyArrowFunction | ts.MethodDeclaration;
    classMemberName: string;
    dependencies: Set<IBeanDescriptor>;
}

export class LifecycleMethodsRepository {
    static contextDescriptorToLifecycleDescriptors = new Map<IContextDescriptor, Set<IContextLifecycleDescriptor>>();

    static register(contextDescriptor: IContextDescriptor, lifecycleDescriptor: IContextLifecycleDescriptor): void {
        let existSet = this.contextDescriptorToLifecycleDescriptors.get(contextDescriptor);

        if (!existSet) {
            existSet = new Set<IContextLifecycleDescriptor>();

            this.contextDescriptorToLifecycleDescriptors.set(contextDescriptor, existSet);
        }

        existSet.add(lifecycleDescriptor);
    }

    static clearBeanInfoByContextDescriptor(contextDescriptor: IContextDescriptor): void {
        this.contextDescriptorToLifecycleDescriptors.delete(contextDescriptor);
    }
}
