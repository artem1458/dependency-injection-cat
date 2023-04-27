import { AbstractStatistics, StatisticsType } from './AbstractStatistics';
import { IContextDescriptor } from '../../core/context/ContextRepository';
import { getPositionOfNode, INodePosition } from '../../core/utils/getPositionOfNode';
import { BeanRepository } from '../../core/bean/BeanRepository';

export class ContextDetailsStatistics extends AbstractStatistics {
    public type = StatisticsType.CONTEXT_DETAILS;
    public path: string;
    public name: string;
    public className: string;
    public namePosition: INodePosition;
    public beansCount: number;

    constructor(contextDescriptor: IContextDescriptor) {
        super();

        this.path = contextDescriptor.absolutePath;
        this.name = contextDescriptor.name;
        this.className = contextDescriptor.className;
        this.namePosition = getPositionOfNode(contextDescriptor.node.name);
        this.beansCount = (BeanRepository.contextIdToBeanDescriptorsMap.get(contextDescriptor.id) ?? []).length;
    }
}
