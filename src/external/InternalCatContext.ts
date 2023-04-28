import { BeanNotFoundInContext } from '../exceptions/runtime/BeanNotFoundInContext';

export interface IBeanConfig {
    scope: 'prototype' | 'singleton';
    isPublic: boolean;
}

type TBeanName = string;

export type TLifecycle = 'post-construct' | 'before-destruct';

export abstract class InternalCatContext {
    [beanName: string]: any;

    static reservedNames = new Set([
        'dicat_contextName',
        'dicat_beanConfigurationRecord',
        'dicat_lifecycleConfiguration',
        'dicat_postConstruct',
        'dicat_beforeDestruct',
        'dicat_init',
        'dicat_singletonMap',
        'dicat_config',
        'config',
        'getBean',
        'getBeans',
        'getPrivateBean',
        'dicat_getBeanConfiguration',
    ]);

    abstract dicat_contextName: string;
    abstract dicat_beanConfigurationRecord: Record<TBeanName, Partial<IBeanConfig>>;
    abstract dicat_lifecycleConfiguration: Record<TLifecycle, TBeanName[]>;

    dicat_init(contextConfig: any): void {
        this.dicat_config = contextConfig;
    }

    dicat_postConstruct(): void {
        this.dicat_lifecycleConfiguration['post-construct'].forEach(methodName => {
            this[methodName]();
        });
    }

    dicat_beforeDestruct(): void {
        this.dicat_lifecycleConfiguration['before-destruct'].forEach(methodName => {
            this[methodName]();
        });
    }

    private dicat_singletonMap = new Map<TBeanName, any>();

    private dicat_config: any = null;

    get config(): any {
        return this.dicat_config;
    }

    getBean<T>(beanName: TBeanName): T {
        const beanConfiguration = this.dicat_getBeanConfiguration(beanName);

        if (!beanConfiguration.isPublic) {
            console.warn(`Bean ${beanName} is not defined in TBeans interface.\nThis Bean will not be checked for correctness at compile-time.\nContext name: ${this.dicat_contextName}`);
        }

        return this.getPrivateBean(beanName);
    }

    protected getPrivateBean<T>(beanName: TBeanName): T {
        const beanConfiguration = this.dicat_getBeanConfiguration(beanName);

        if (beanConfiguration.scope !== 'singleton') {
            return this[beanName]();
        }

        const savedInstance = this.dicat_singletonMap.get(beanName) ?? this[beanName]();

        if (!this.dicat_singletonMap.has(beanName)) {
            this.dicat_singletonMap.set(beanName, savedInstance);
        }

        return savedInstance;
    }

    private dicat_getBeanConfiguration(beanName: TBeanName): IBeanConfig {
        const beanConfiguration = this.dicat_beanConfigurationRecord[beanName] ?? null;

        if (beanConfiguration === null) {
            throw new BeanNotFoundInContext(this.dicat_contextName, beanName);
        }

        return {
            scope: 'singleton',
            isPublic: false,
            ...beanConfiguration,
        };
    }

    getBeans(): any {
        const publicBeansConfigurations: Record<string, IBeanConfig> = {};
        Object.keys(this.dicat_beanConfigurationRecord).forEach(key => {
            const beanConfig = this.dicat_getBeanConfiguration(key);

            if (beanConfig.isPublic) {
                publicBeansConfigurations[key] = beanConfig;
            }
        });

        return Object.keys(publicBeansConfigurations)
            .reduce((previousValue, currentValue) => ({
                ...previousValue,
                [currentValue]: this.getBean(currentValue),
            }), {});
    }
}
