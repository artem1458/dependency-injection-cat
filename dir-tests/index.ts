import { container } from 'ts-pring';
import { IRequester } from './IRequester';

const requester0 = container.get<IRequester>('SuperCoolRequester');
const requester1 = container.get<IRequester>('SuperCoolRequester');

console.log(requester0 === requester1, 'Logger 1 is equal to 2');
