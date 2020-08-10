import { container } from 'ts-pring';
import { IRequester } from '@src/IRequester';

const requester = container.get<IRequester<string>>();

requester.sendRequest('1232131')
