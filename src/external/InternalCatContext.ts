import { filter } from 'lodash';
import { NotInitializedConfig } from '../exceptions/runtime/NotInitializedConfig';
import { IBeanConfig } from './decorators/Bean';
import { BeanNotFoundInContext } from '../exceptions/runtime/BeanNotFoundInContext';
import { IInternalCatContext } from './IInternalCatContext';

type TBeanName = string;

export abstract class InternalCatContext implements IInternalCatContext {
    [beanName: string]: any;

    constructor(
        private contextName: string,
        private beanConfigurationRecord: Record<TBeanName, IBeanConfig>,
    ) {}

    private singletonMap = new Map<TBeanName, any>();

    private _config: any = 'UNINITIALIZED_CONFIG';

    get config(): any {
        if (this._config === 'UNINITIALIZED_CONFIG') {
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
            console.warn(`You are accessing to the Bean ${beanName}, that is not defined in TBeans interface. Context name: ${this.contextName}`);
        }

        return this.getPrivateBean(beanName);
    }

    protected getPrivateBean<T>(beanName: TBeanName): T {
        const beanConfiguration = this.getBeanConfiguration(beanName);

        if (beanConfiguration.scope !== 'singleton') {
            return this[beanName]();
        }

        let savedInstance = this.singletonMap.get(beanName) ?? null;

        if (savedInstance === null) {
            savedInstance = this[beanName]();
            this.singletonMap.set(beanName, savedInstance);
        }

        return savedInstance;
    }

    private getBeanConfiguration(beanName: TBeanName): IBeanConfig {
        const beanConfiguration = this.beanConfigurationRecord[beanName] ?? null;

        if (beanConfiguration === null) {
            throw new BeanNotFoundInContext(this.contextName, beanName);
        }

        return beanConfiguration;
    }

    getBeans(): Record<string, any> {
        const publicBeanConfigurations = filter(this.beanConfigurationRecord, value => value.isPublic);

        return Object.keys(publicBeanConfigurations)
            .reduce((previousValue, currentValue) => ({
                ...previousValue,
                [currentValue]: this.getBean(currentValue),
            }), {});
    }
}
