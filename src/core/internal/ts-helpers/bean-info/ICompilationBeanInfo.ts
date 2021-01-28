export type TBeanScopeValue = 'prototype' | 'singleton';

export interface ICompilationBeanInfo {
    qualifier: string | null;
    scope: TBeanScopeValue;
}