export class GraphForBeansIsNotRegistered extends Error {
    constructor(
        private beanName: string,
        private originalTypeName: string,
    ) {
        super();
    }

    name = 'NotFoundException';
    message = `Graph for bean ${this.beanName} is not registered
    beanType ${this.originalTypeName}
    `
}
