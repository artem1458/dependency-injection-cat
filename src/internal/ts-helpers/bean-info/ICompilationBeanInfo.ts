export type TBeanScopeValue = 'prototype' | 'singleton';

export interface ICompilationBeanInfo {
    qualifier: string;
    scope: TBeanScopeValue;
}
