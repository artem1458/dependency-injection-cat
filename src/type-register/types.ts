import { IBeanInfo } from '../decorators/Bean';

export interface ITypeInfo {
    id: string;
    originalName: string;
    configId: string;
    configPath: string;
    beanName: string;
    factoryName: string;
    beanInfo: IBeanInfo;
}

export interface IRegisterTypeProps {
    typeId: string;
    originalTypeName: string;
    configPath: string;
    configName: string;
    beanName: string;
    beanInfo: IBeanInfo;
}
