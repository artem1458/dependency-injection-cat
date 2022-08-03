import { AbstractStatistics, StatisticsType } from './AbstractStatistics';
import { IBeanDescriptor } from '../../../../core/bean/BeanRepository';
import { getPositionOfNode, INodePosition } from '../../../../core/utils/getPositionOfNode';
import upath from 'upath';
import { isNamedClassDeclaration } from '../../../../core/ts-helpers/predicates/isNamedClassDeclaration';

export class BeanDeclarationLinkStatistics extends AbstractStatistics {

    static build(descriptor: IBeanDescriptor): BeanDeclarationLinkStatistics[] {
        const result: BeanDeclarationLinkStatistics[] = [];

        if (descriptor.publicInfo !== null) {
            const linkPosition: IBeanDeclarationLinkStatisticsPosition = {
                path: upath.normalize(descriptor.publicInfo.publicNode.getSourceFile().fileName),
                nodePosition: getPositionOfNode(descriptor.publicInfo.publicNode.name),
            };

            result.push(new BeanDeclarationLinkStatistics(descriptor, linkPosition));
        }

        if (
            descriptor.beanKind === 'property'
            && descriptor.beanImplementationSource?.node
            && isNamedClassDeclaration(descriptor.beanImplementationSource.node)
        ) {
            const linkPosition: IBeanDeclarationLinkStatisticsPosition = {
                path: descriptor.beanImplementationSource.path,
                nodePosition: getPositionOfNode(descriptor.beanImplementationSource.node.name),
            };

            result.push(new BeanDeclarationLinkStatistics(descriptor, linkPosition));
        }

        return result;
    }

    public type = StatisticsType.BEAN_DECLARATION_LINK;
    public linkPosition: IBeanDeclarationLinkStatisticsPosition;
    public contextPosition: IBeanDeclarationLinkStatisticsPosition;
    public contextName: string;
    public beanNameInContext: string;

    private constructor(
        descriptor: IBeanDescriptor,
        linkPosition: IBeanDeclarationLinkStatisticsPosition,
    ) {
        super();

        this.contextPosition = {
            path: descriptor.contextDescriptor.absolutePath,
            nodePosition: getPositionOfNode(descriptor.node)
        };

        this.contextName = descriptor.contextDescriptor.name;
        this.beanNameInContext = descriptor.classMemberName;

        this.linkPosition = linkPosition;
    }
}

export interface IBeanDeclarationLinkStatisticsPosition {
    path: string;
    nodePosition: INodePosition;
}
