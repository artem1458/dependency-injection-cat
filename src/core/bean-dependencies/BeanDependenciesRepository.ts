import ts from 'typescript';
import { IBeanDescriptor, IBeanDescriptorWithId } from '../bean/BeanRepository';
import { IContextDescriptor } from '../context/ContextRepository';
import { QualifiedType } from '../ts-helpers/type-qualifier/QualifiedType';
import { ExtendedSet } from '../utils/ExtendedSet';

export interface IBeanDependencyDescriptor {
    parameterName: string;
    qualifier: TBeanDependencyQualifier;
    contextName: TContextName;
    qualifiedType: QualifiedType;
    node: ts.ParameterDeclaration;
    qualifiedBeans: ExtendedSet<IBeanDescriptorWithId>;
}

type TBeanDependencyQualifier = string | null;
type TContextName = string;

export class BeanDependenciesRepository {
    static data = new Map<TContextName, Map<IBeanDescriptor, IBeanDependencyDescriptor[]>>();

    static registerBeanDependency(beanDescriptor: IBeanDescriptor, dependencyDescriptor: IBeanDependencyDescriptor) {
        const dependenciesMap = this.data.get(dependencyDescriptor.contextName) ?? new Map();

        if (!this.data.has(dependencyDescriptor.contextName)) {
            this.data.set(dependencyDescriptor.contextName, dependenciesMap);
        }

        let beanDependencyDescriptors = dependenciesMap.get(beanDescriptor) ?? null;

        if (beanDependencyDescriptors === null) {
            beanDependencyDescriptors = [];
            dependenciesMap.set(beanDescriptor, beanDependencyDescriptors);
        }

        beanDependencyDescriptors.push(dependencyDescriptor);
    }

    static getBeanDescriptorMapByContextName(contextName: TContextName): Map<IBeanDescriptor, IBeanDependencyDescriptor[]> | null {
        return this.data.get(contextName) ?? null;
    }

    static clearBeanDependenciesByContextDescriptor(contextDescriptor: IContextDescriptor) {
        this.data.delete(contextDescriptor.name);
    }

    static clear(): void {
        this.data.clear();
    }
}
