import { TInternalCatContext } from './InternalCatContext';
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

    protected constructor(
        private contextName: string,
        private beansConfig: Map<TBeanName, IBeanConfig>,
        private context: TInternalCatContext
    ) {}

    initContext({
        key = this.DEFAULT_CONTEXT_KEY,
        config,
    }: IContextProps): any {
        const newContext = new this.context(this.contextName, this.beansConfig);
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
