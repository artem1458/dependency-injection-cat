import { ErrorBuilder } from './ErrorBuilder';

export interface IBeanConfig {
    scope: 'prototype' | 'singleton';
    isPublic: boolean;
}

type BeanName = string;

export type BeanLifecycle = 'post-construct' | 'before-destruct';

export abstract class InternalCatContext {
    [beanName: string]: any;

    static reservedNames = new Set([
        'dicat_static_init',
        'dicat_static_contextName',
        'dicat_static_beanConfiguration',
        'dicat_static_lifecycleConfiguration',

        'dicat_postConstruct',
        'dicat_beforeDestruct',
        'dicat_init',
        'dicat_singletonMap',
        'dicat_config',
        'config',
        'dicat_getBean',
        'dicat_getBeans',
        'dicat_getPrivateBean',
        'dicat_getBeanConfiguration',

        'dicat_createSet',
        'dicat_createMap',
    ]);

    static dicat_static_contextName: string | null = null;
    declare static dicat_static_beanConfiguration: Record<BeanName, Partial<IBeanConfig>>;
    declare static dicat_static_lifecycleConfiguration: Record<BeanLifecycle, BeanName[]>;

    dicat_init(contextConfig: any): void {
        this.dicat_config = contextConfig;
    }

    dicat_postConstruct(): void {
        this.getStaticConstructorProperty('dicat_static_lifecycleConfiguration')['post-construct'].forEach(methodName => {
            this[methodName]();
        });
    }

    dicat_beforeDestruct(): void {
        this.getStaticConstructorProperty('dicat_static_lifecycleConfiguration')['before-destruct'].forEach(methodName => {
            this[methodName]();
        });
    }

    private dicat_singletonMap = new Map<BeanName, any>();

    private dicat_config: any = null;

    get config(): any {
        return this.dicat_config;
    }

    dicat_getBean<T>(beanName: BeanName): T {
        const beanConfiguration = this.dicat_getBeanConfiguration(beanName);

        if (!beanConfiguration.isPublic) {
            console.warn(`Bean ${beanName} is not defined in TBeans interface.\nThis Bean will not be checked for correctness at compile-time.\nContext name: ${this.getStaticConstructorProperty('dicat_static_contextName')}`);
        }

        return this.dicat_getPrivateBean(beanName);
    }

    protected dicat_getPrivateBean<T>(beanName: BeanName): T {
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

    private dicat_getBeanConfiguration(beanName: BeanName): IBeanConfig {
        const beanConfiguration = this.getStaticConstructorProperty('dicat_static_beanConfiguration')[beanName] ?? null;

        if (beanConfiguration === null) {
            throw ErrorBuilder.beanNotFoundInContext(this.getStaticConstructorProperty('dicat_static_contextName'), beanName);
        }

        return {
            scope: 'singleton',
            isPublic: false,
            ...beanConfiguration,
        };
    }

    dicat_getBeans(): any {
        const publicBeansConfigurations: Record<string, IBeanConfig> = {};
        Object.keys(this.getStaticConstructorProperty('dicat_static_beanConfiguration')).forEach(key => {
            const beanConfig = this.dicat_getBeanConfiguration(key);

            if (beanConfig.isPublic) {
                publicBeansConfigurations[key] = beanConfig;
            }
        });

        return Object.keys(publicBeansConfigurations)
            .reduce((previousValue, currentValue) => ({
                ...previousValue,
                [currentValue]: this.dicat_getBean(currentValue),
            }), {});
    }

    private getStaticConstructorProperty<T extends keyof typeof InternalCatContext>(property: T): typeof InternalCatContext[T] {
        return (this.constructor as any)[property];
    }

    protected dicat_createSet<V>(values: V[]): Set<V> {
        return new Set(values);
    }

    protected dicat_createMap<K, V>(values: [K, V][]): Map<K, V> {
        return new Map(values);
    }
}
