import { IBeanDescriptor, IBeanDescriptorWithId } from '../../bean/BeanRepository';

export const isBeanDependencyFromCurrentContext = (bean: IBeanDescriptor, beanDependency: IBeanDescriptorWithId): boolean =>
    bean.contextDescriptor.id === beanDependency.contextDescriptor.id;
