import { container } from 'ts-pring';
export default interface IInterface {}

const a = container.get<IInterface>();
a;
