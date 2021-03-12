export interface IDIContext<TBeans> {
    getBeans(): TBeans;
    getBean<TBean extends keyof TBeans>(beanName: TBean): TBeans[TBean];
}
