import { CatContext, Bean } from 'dependency-injection-cat';
import { SomeClass, XZ } from '../configs/types';


export class TestConfig2 extends CatContext {
    beann: XZ = Bean(SomeClass)
}
