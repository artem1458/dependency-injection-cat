import ts from 'typescript';
import { IBeanDescriptor, IBeanDescriptorWithId } from '../bean/BeanRepository';
import { IContextDescriptor } from '../context/ContextRepository';

export interface IBeanDependencyDescriptor {
    parameterName: string;
    qualifier: TBeanDependencyQualifier;
    contextName: TContextName;
    type: TBeanDependencyType;
    originalTypeName: string;
    node: ts.ParameterDeclaration;
    qualifiedBean: IBeanDescriptorWithId | null;
}

type TBeanDependencyQualifier = string | null;
type TContextName = string;
type TBeanDependencyType = string;

export class BeanDependenciesRepository {
    static beanDependenciesRepository = new Map<TContextName, Map<IBeanDescriptor, IBeanDependencyDescriptor[]>>();

    static registerBeanDependency(beanDescriptor: IBeanDescriptor, dependencyDescriptor: IBeanDependencyDescriptor) {
        let dependenciesMap = this.beanDependenciesRepository.get(dependencyDescriptor.contextName) ?? null;

        if (dependenciesMap === null) {
            dependenciesMap = new Map();
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
}
