import { TRealCatContext } from './RealCatContext';
import { NoContextByKey } from '../exceptions/runtime/NoContextByKey';
import { IBeanConfig } from './decorators/Bean';

interface IContextProps {
    key: any;
    config: any;
}

type TBeanName = string;

export class ContextPool {
    private DEFAULT_CONTEXT_KEY = {};
    private pool = new Map();

    constructor(
        private contextName: string,
        private beanConfigurationRecord: Record<TBeanName, IBeanConfig>,
        private context: TRealCatContext
    ) {}

    initContext({
        key = this.DEFAULT_CONTEXT_KEY,
        config,
    }: IContextProps): any {
        const newContext = new this.context(this.contextName, this.beanConfigurationRecord);
        newContext.config = config;

        this.pool.set(key, newContext);

        return newContext;
    }

    getContext({ key = this.DEFAULT_CONTEXT_KEY }: IContextProps): any {
        const context = this.pool.get(key);

        if (context === undefined) {
            throw new NoContextByKey(this.contextName, key);
        }

        return context;
    }

    clearContext({ key = this.DEFAULT_CONTEXT_KEY }: IContextProps): void {
        this.pool.delete(key);
    }
}
