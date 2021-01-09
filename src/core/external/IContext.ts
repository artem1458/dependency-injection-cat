type TBeanName = string;

export interface IContext<TBeans extends Record<TBeanName, any>> {
    getBeans(): TBeans;
    getBean<TBean extends keyof TBeans>(beanName: TBean): TBeans[TBean];
    getBean<T>(): T;
}
