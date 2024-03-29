import { IFullBeanConfig, IInternalCatContext } from './IInternalCatContext';
import { NotInitializedConfig } from '../exceptions/runtime/NotInitializedConfig';
import { BeanNotFoundInContext } from '../exceptions/runtime/BeanNotFoundInContext';

type TBeanName = string;

export type TLifecycle = 'post-construct' | 'before-destruct';
export type TLifecycleConfiguration = Record<TLifecycle, TBeanName[]>

export abstract class InternalCatContext implements IInternalCatContext {
    [beanName: string]: any;

    constructor(
        private contextName: string,
        private beanConfigurationRecord: Record<TBeanName, IFullBeanConfig>,
        private lifecycleConfiguration: TLifecycleConfiguration,
    ) {}

    ___postConstruct(): void {
        this.lifecycleConfiguration['post-construct'].forEach(methodName => {
            this[methodName]();
        });
    }
    ___beforeDestruct(): void {
        this.lifecycleConfiguration['before-destruct'].forEach(methodName => {
            this[methodName]();
        });
    }

    private singletonMap = new Map<TBeanName, any>();

    private notInitializedConfigMarker = {}
    private _config: any = this.notInitializedConfigMarker;

    get config(): any {
        if (this._config === this.notInitializedConfigMarker) {
            throw new NotInitializedConfig();
        }

        return this._config;
    }

    set config(config: any) {
        this._config = config;
    }

    getBean<T>(beanName: TBeanName): T {
        const beanConfiguration = this.getBeanConfiguration(beanName);

        if (!beanConfiguration.isPublic) {
            console.warn(`Bean ${beanName} is not defined in TBeans interface.\nThis Bean will not be checked for correctness at compile-time.\nContext name: ${this.contextName}`);
        }

        return this.getPrivateBean(beanName);
    }

    protected getPrivateBean<T>(beanName: TBeanName): T {
        const beanConfiguration = this.getBeanConfiguration(beanName);

        if (beanConfiguration.scope !== 'singleton') {
            return this[beanName]();
        }

        const savedInstance = this.singletonMap.get(beanName) ?? this[beanName]();

        if (!this.singletonMap.has(beanName)) {
            this.singletonMap.set(beanName, savedInstance);
        }

        return savedInstance;
    }

    private getBeanConfiguration(beanName: TBeanName): IFullBeanConfig {
        const beanConfiguration = this.beanConfigurationRecord[beanName] ?? null;

        if (beanConfiguration === null) {
            throw new BeanNotFoundInContext(this.contextName, beanName);
        }

        return beanConfiguration;
    }

    getBeans(): Record<string, any> {
        const publicBeansConfigurations: Record<string, IFullBeanConfig> = {};
        Object.keys(this.beanConfigurationRecord).forEach(key => {
            const beanConfigRecord = this.beanConfigurationRecord[key];

            if (beanConfigRecord?.isPublic) {
                publicBeansConfigurations[key] = beanConfigRecord;
            }
        });

        return Object.keys(publicBeansConfigurations)
            .reduce((previousValue, currentValue) => ({
                ...previousValue,
                [currentValue]: this.getBean(currentValue),
            }), {});
    }
}
