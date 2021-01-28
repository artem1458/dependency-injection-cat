import ts from 'typescript';
import { TBeanScopeValue } from '../ts-helpers/bean-info/ICompilationBeanInfo';

export interface IBeanDescriptor {
    classMemberName: string;
    qualifierName: string | null;
    contextName: string;
    typeId: string;
    originalTypeName: string;
    scope: TBeanScopeValue;
    node: ts.MethodDeclaration | ts.PropertyDeclaration;
}

//Repository for return types of bean
export class BeansRepository {
    static beansDescriptorRepository = new Map<ts.MethodDeclaration | ts.PropertyDeclaration, IBeanDescriptor>();

    static registerMethodBean(descriptor: IBeanDescriptor): void {
        this.beansDescriptorRepository.set(descriptor.node, descriptor);
    }
}
