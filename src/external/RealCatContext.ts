import { NotInitializedConfig } from '../exceptions/runtime/NotInitializedConfig';
import { IBeanConfig } from './decorators/Bean';
import { BeanNotFoundInContext } from '../exceptions/runtime/BeanNotFoundInContext';

type TBeanName = string;

export type TRealCatContext = {
    new(
        contextName: string,
        beanConfigurationRecord: Record<TBeanName, IBeanConfig>,
    ): IRealCatContext
};

export interface IRealCatContext {
    config: any;
    getBean<T>(beanName: TBeanName): T;
    getBeans(): Record<string, any>;
}

export abstract class RealCatContext implements IRealCatContext {
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
        const beanConfiguration = this.beanConfigurationRecord[beanName] ?? null;

        if (beanConfiguration === null) {
            throw new BeanNotFoundInContext(this.contextName, beanName);
        }

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

    getBeans(): Record<string, any> {
        return Object.keys(this.beanConfigurationRecord)
            .reduce((previousValue, currentValue) => ({
                ...previousValue,
                [currentValue]: this.getBean(currentValue),
            }), {});
    }
}
