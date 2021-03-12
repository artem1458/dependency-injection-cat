export class BeanNotFoundInContext extends Error {
    constructor(
        private contextName: string,
        private beanName: string,
    ) {
        super();

        this.name = 'NotFoundException';
        this.message = `Bean "${this.beanName}" is missing in context "${this.contextName}"`;
    }
}
