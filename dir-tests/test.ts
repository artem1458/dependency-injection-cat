import { Container } from 'dependency-injection-cat';

interface IOptions {
    accountId: string;
}

interface IBeans {
    value: string;
}

const context = Container.initContext<IBeans, IOptions>('contextValue', { accountId: '' });
const context2 = Container.getContext<IBeans>('123');
context.getBean('value');
const beans = context.getBeans();
beans.value;
