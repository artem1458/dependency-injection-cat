import { container } from 'ts-pring';
import { IRequester } from './IRequester';

const logger = container.get<IRequester>();
const logger2 = container.get<IRequester>();

console.log(logger === logger2, 'Logger 1 is equal to 2');
