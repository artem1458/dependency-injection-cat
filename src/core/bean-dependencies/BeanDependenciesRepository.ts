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
    static beanDependenciesRepository = new Map<TContextName, Map<IBeanDescriptor, IBeanDependencyDescriptor[]>>();

    static registerBeanDependency(beanDescriptor: IBeanDescriptor, dependencyDescriptor: IBeanDependencyDescriptor) {
        const dependenciesMap = this.beanDependenciesRepository.get(dependencyDescriptor.contextName) ?? new Map();

        if (!this.beanDependenciesRepository.has(dependencyDescriptor.contextName)) {
            this.beanDependenciesRepository.set(dependencyDescriptor.contextName, dependenciesMap);
        }

        let beanDependencyDescriptors = dependenciesMap.get(beanDescriptor) ?? null;

        if (beanDependencyDescriptors === null) {
            beanDependencyDescriptors = [];
            dependenciesMap.set(beanDescriptor, beanDependencyDescriptors);
        }

        beanDependencyDescriptors.push(dependencyDescriptor);
    }

    static getBeanDescriptorMapByContextName(contextName: TContextName): Map<IBeanDescriptor, IBeanDependencyDescriptor[]> | null {
        return this.beanDependenciesRepository.get(contextName) ?? null;
    }

    static clearBeanDependenciesByContextDescriptor(contextDescriptor: IContextDescriptor) {
        this.beanDependenciesRepository.delete(contextDescriptor.name);
    }

    static clear(): void {
        this.beanDependenciesRepository.clear();
    }
}
