import ts from 'typescript';
import { IBeanDescriptor } from '../bean/BeanRepository';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { isClassPropertyBean } from '../ts-helpers/predicates/isClassPropertyBean';
import { isMethodBean } from '../ts-helpers/predicates/isMethodBean';

export const getAllBeanNamesInContextByBeanDescriptor = (descriptor: IBeanDescriptor): string[] => {
    const parent = descriptor.node.parent as ts.ClassDeclaration;
    return parent.members
        .filter((it): it is ClassPropertyDeclarationWithInitializer | ts.MethodDeclaration => isClassPropertyBean(it) || isMethodBean(it))
        .map(it => it.name.getText());
};
