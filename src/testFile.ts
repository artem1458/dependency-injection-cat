import { container } from 'ts-pring';
export interface IInterface {}

const a = container.get<IInterface>();
a;
