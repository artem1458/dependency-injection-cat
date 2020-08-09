export interface INodeSourceDescriptor {
    name: string;
    path: string;
    importType?: ImportType;
}

export enum ImportType {
    Default = 'Default',
    Namespace = 'Namespace',
    Named = 'Named',
}
