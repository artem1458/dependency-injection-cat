import { CatContext, Bean, Qualifier } from 'dependency-injection-cat';
import { XZ } from './types';

export interface IT {}

export class AA {}

export class TestConfig2 extends CatContext {
    beann: XZ = Bean(AA)
}
