import { container } from 'ts-pring';
import { ILogger } from './ILogger';
import { IRequester } from './IRequester';

const logger = container.get<IRequester>('123');
const logger2 = container.get<IRequester>('123');

console.log(logger);
console.log(logger === logger2, 'Logger 1 is equal to 2');
