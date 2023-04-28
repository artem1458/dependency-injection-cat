export interface Context<T> {
    getBeans(): T;
    getBean<K extends keyof T>(beanName: K): T[K];
}
