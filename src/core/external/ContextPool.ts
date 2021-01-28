import { InternalCatContext } from './InternalCatContext';
import { NoContextByKey } from '../exceptions/runtime/NoContextByKey';

interface IContextProps {
    key: any;
    config: any;
}

export abstract class ContextPool {
    private DEFAULT_CONTEXT_KEY = {};
    private pool = new Map();

    protected constructor(
        private contextName: string,
        private context: new () => InternalCatContext,
    ) {}

    initContext({
        key = this.DEFAULT_CONTEXT_KEY,
        config,
    }: IContextProps): any {
        const newContext = new this.context();
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
