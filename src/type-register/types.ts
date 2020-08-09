export interface ITypeInfo {
    id: string;
    originalName: string;
    configId: string;
    configPath: string;
    beanName: string;
    factoryName: string;
}

export interface IRegisterTypeProps {
    typeId: string;
    originalTypeName: string;
    configPath: string;
    configName: string;
    beanName: string;
}
