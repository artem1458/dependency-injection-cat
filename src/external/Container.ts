import { Context } from './Context';
import { CatContext } from './CatContext';
import { InternalCatContext } from './InternalCatContext';
import { NoContextByKey } from '../exceptions/runtime/NoContextByKey';
import { ClassNotExtendsCatContext } from '../exceptions/runtime/ClassNotExtendsCatContext';

export interface ContextInit<T, C = null> {
    context: { new(): CatContext<T, C> };
    key?: any;
}

export interface ContextInitWithConfig<T, C> extends ContextInit<T, C> {
    config: C extends null ? never : C;
}

export interface IContainer {
    /**
     * T should be a plain interface without extending
     */
    initContext<T>(init: ContextInit<T>): Context<T>;

    initContext<T, C>(init: ContextInitWithConfig<T, C>): Context<T>;

    /**
     * T should be a plain interface without extending
     */
    getContext<T>(init: ContextInit<T>): Context<T>;

    getContext<T, C>(init: ContextInitWithConfig<T, C>): Context<T>;

    /**
     * T should be a plain interface without extending
     */
    getOrInitContext<T>(init: ContextInit<T>): Context<T>;

    getOrInitContext<T, C>(init: ContextInitWithConfig<T, C>): Context<T>;

    clearContext<T>(init: ContextInit<T>): void;
}

class Container implements IContainer {
    private pools: Map<{ new(): CatContext<any> }, Map<any, InternalCatContext>> = new Map();

    initContext<T>(init: ContextInit<T>): Context<T>;
    initContext<T, C>(init: ContextInitWithConfig<T, C>): Context<T>;
    initContext<T, C>(init: ContextInitWithConfig<T, C>): Context<T> {
        if (!(init.context.prototype instanceof InternalCatContext)) {
            throw new ClassNotExtendsCatContext();
        }

        const pool = this.getPool(init.context as any);
        const instance = new init.context() as unknown as InternalCatContext;

        if (init.config !== undefined) {
            instance.dicat_init(init.config);
        }

        pool.set(init.key, instance);

        try {
            return instance as Context<T>;
        } finally {
            instance.dicat_postConstruct();
        }
    }

    getContext<T>(init: ContextInit<T>): Context<T>;
    getContext<T, C>(init: ContextInitWithConfig<T, C>): Context<T>;
    getContext<T, C>(init: ContextInitWithConfig<T, C>): Context<T> {
        if (!(init.context.prototype instanceof InternalCatContext)) {
            throw new ClassNotExtendsCatContext();
        }
        const pool = this.getPool(init.context as any);
        const instance = pool.get(init.key);

        if (!instance) {
            throw new NoContextByKey((init.context as any)['dicat_contextName'], init.key);
        }

        return instance as any;
    }

    getOrInitContext<T>(init: ContextInit<T>): Context<T>;
    getOrInitContext<T, C>(init: ContextInitWithConfig<T, C>): Context<T>;
    getOrInitContext<T, C>(init: ContextInitWithConfig<T, C>): Context<T> {
        if (!(init.context.prototype instanceof InternalCatContext)) {
            throw new ClassNotExtendsCatContext();
        }
        const pool = this.getPool(init.context as any);
        const instance = pool.get(init.key);

        if (instance) {
            return instance as Context<T>;
        }

        return this.initContext(init);
    }

    clearContext<T>(init: ContextInit<T>): void {
        if (!(init.context.prototype instanceof InternalCatContext)) {
            throw new ClassNotExtendsCatContext();
        }
        const pool = this.getPool(init.context);
        const instance = pool.get(init.key);

        if (!instance) {
            return console.warn(`Trying to clear not initialized context: ${init}`);
        }

        try {
            pool.delete(init.key);

            if (pool.size === 0) {
                this.pools.delete(init.context);
            }
        } finally {
            instance.dicat_beforeDestruct();
        }
    }

    private getPool(context: { new(): CatContext<any> }): Map<any, InternalCatContext> {
        let pool = this.pools.get(context);

        if (!pool) {
            pool = new Map();
            this.pools.set(context, pool);
        }

        return pool;
    }
}

export const container: IContainer = new Container();
