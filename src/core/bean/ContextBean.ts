import ts from 'typescript';
import { DIType } from '../type-system/DIType';
import { BeanLifecycle } from '../../external/InternalCatContext';
import {
    ClassPropertyWithArrowFunctionInitializer,
    ClassPropertyWithCallExpressionInitializer,
    ClassPropertyWithExpressionInitializer
} from '../ts/types';
import { BeanScope } from './BeanScope';
import { BeanKind } from './BeanKind';
import { Context } from '../context/Context';
import { BeanDependency } from '../bean-dependency/BeanDependency';

export type BeanNode = ts.MethodDeclaration
    | ClassPropertyWithCallExpressionInitializer
    | ClassPropertyWithArrowFunctionInitializer
    | ts.PropertyDeclaration
    | ClassPropertyWithExpressionInitializer;

export class ContextBean<T = BeanNode> {
    constructor(values: Partial<ContextBean> = {}) {
        Object.assign(this, values);
    }

    declare id: string; //Set by Context during registration
    declare context: Context;
    declare classMemberName: string;
    declare diType: DIType;
    declare node: T;
    declare kind: BeanKind;

    classDeclaration: ts.ClassDeclaration | null = null;
    nestedProperty: string | null = null;
    scope: BeanScope = BeanScope.SINGLETON;
    lifecycle: BeanLifecycle[] | null = null;
    public = false;
    dependencies = new Set<BeanDependency>();

    get fullName(): string {
        if (this.nestedProperty === null) {
            return this.classMemberName;
        }

        return `${this.classMemberName}.${this.nestedProperty}`;
    }
}
