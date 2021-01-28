import ts from 'typescript';

export interface IBeanDescriptor {
    classPropertyName: string;
    qualifierName: string;
    contextName: string;
    typeId: string;
    originalTypeName: string;
    scope: 'prototype' | 'singleton';
    node: ts.MethodDeclaration | ts.PropertyDeclaration;
}

//Repository for return types of bean
export class BeansRepository {
    static beansDescriptorRepository = new Map<ts.MethodDeclaration | ts.PropertyDeclaration, IBeanDescriptor>();

    static registerMethodBean(
        classPropertyName: string,
        qualifierName: string,
        contextName: string,
        typeId: string,
        originalTypeName: string,
        scope: 'prototype' | 'singleton',
        node: ts.MethodDeclaration | ts.PropertyDeclaration,
    ): void {
        const descriptor: IBeanDescriptor = {
            classPropertyName,
            qualifierName,
            contextName,
            typeId,
            originalTypeName,
            scope,
            node,
        };

        this.beansDescriptorRepository.set(node, descriptor);
    }
}
