import { NotInitializedConfig } from '../exceptions/runtime/NotInitializedConfig';
import { IBeanConfig } from './decorators/Bean';
import { BeanNotFoundInContext } from '../exceptions/runtime/BeanNotFoundInContext';

type TBeanName = string;

export type TInternalCatContext = new (
    contextName: string,
    beanConfigurationMap: Map<TBeanName, IBeanConfig>,
) => InternalCatContext;

export abstract class InternalCatContext {
    [bean: string]: any;

    protected constructor(
        private contextName: string,
        private beanConfigurationMap: Map<TBeanName, IBeanConfig>,
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

    getBean(beanName: TBeanName): any {
        const beanConfiguration = this.beanConfigurationMap.get(beanName) ?? null;

        if (beanConfiguration === null) {
            throw new BeanNotFoundInContext(this.contextName, beanName);
        }

        if (beanConfiguration.scope !== 'singleton') {
            return new this[beanName]();
        }

        let savedInstance = this.singletonMap.get(beanName) ?? null;

        if (savedInstance === null) {
            savedInstance = new this[beanName]();
            this.singletonMap.set(beanName, savedInstance);
        }

        return savedInstance;
    }
}
