import { TLifecycleConfiguration } from './InternalCatContext';

export interface IFullBeanConfig {
    scope?: 'prototype' | 'singleton';
    isPublic?: boolean;
}

export interface IInternalCatContext {
    config: any;
    getBean<T>(beanName: string): T;
    getBeans(): Record<string, any>;
    ___postConstruct(): void;
    ___beforeDestruct(): void;
}

export type TInternalCatContext = {
    new(
        contextName: string,
        beanConfigurationRecord: Record<string, IFullBeanConfig>,
        lifecycleConfiguration: TLifecycleConfiguration,
    ): IInternalCatContext
};
