import { CatContext, Bean } from 'dependency-injection-cat';
import { IBeans } from '../IBeans';
import { IUseCase } from '../lib/use-case/IUseCase';
import { UseCase } from '../lib/use-case/UseCase';

class ApplicationContext extends CatContext<IBeans> {
    useCase: IUseCase = Bean(UseCase)
}
