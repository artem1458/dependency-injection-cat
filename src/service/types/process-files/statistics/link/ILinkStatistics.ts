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
    BEAN_DECLARATION = 'BEAN_DECLARATION',
}
