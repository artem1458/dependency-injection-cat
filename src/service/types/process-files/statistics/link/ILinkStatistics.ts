import { INodePosition } from '../../../../../core/utils/getPositionOfNode';

export interface ILinkStatistics {
    linkType: LinkType;
    fromPosition: ILinkPositionDescriptor;
    toPosition: ILinkPositionDescriptor;
    presentableName: string;
}

export interface ILinkPositionDescriptor {
    path: string;
    nodePosition: INodePosition;
}

export enum LinkType {
    BEAN_USAGE_DECLARATION = 'BEAN_USAGE_DECLARATION',
    QUALIFIED_BEAN_DECLARATION = 'QUALIFIED_BEAN_DECLARATION',
    BEAN_DECLARATION = 'BEAN_DECLARATION',
}
