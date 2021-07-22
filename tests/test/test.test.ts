import { container } from 'dependency-injection-cat';
import { IBeans } from '../src/config/Context.di';

describe('test', () => {
    it('container', () => {
        console.log(container.initContext<IBeans>({
            name: 'MainContext'
        }));
    });
});
